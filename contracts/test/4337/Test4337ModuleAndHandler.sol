// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity >=0.7.0 <0.9.0;
pragma abicoder v2;

import "../../libraries/SafeStorage.sol";
import "./UserOperation.sol";

interface ISafe {
    function execTransactionFromModule(address to, uint256 value, bytes memory data, uint8 operation) external returns (bool success);
}

/// @dev A Dummy 4337 Module/Handler for testing purposes
/// @dev DO NOT USE IN PRODUCTION
contract Test4337ModuleAndHandler is SafeStorage {
    using UserOperationLib for UserOperation;

    address public immutable myAddress;
    address public immutable entryPoint;

    address internal constant SENTINEL_MODULES = address(0x1);

    constructor(address entryPointAddress) {
        entryPoint = entryPointAddress;
        myAddress = address(this);
    }

    function validateUserOp(UserOperation calldata userOp, bytes32, uint256 missingAccountFunds) external returns (uint256 validationData) {
        address payable safeAddress = payable(userOp.sender);
        ISafe senderSafe = ISafe(safeAddress);

        if (missingAccountFunds != 0) {
            ISafe(senderSafe).execTransactionFromModule(entryPoint, missingAccountFunds, "", 0);
        }

        return 0;
    }

    function execTransaction(address to, uint256 value, bytes calldata data) external payable {
        // we need to strip out msg.sender address appended by HandlerContext contract from the calldata
        bytes memory callData;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            // Load free memory location
            let pointer := mload(0x40)
            // We allocate memory for the return data by setting the free memory location to
            // current free memory location + data size + 32 bytes for data size value - 32 bytes for stripped msg.sender
            mstore(0x40, add(pointer, calldatasize()))
            // Store the size
            mstore(pointer, sub(calldatasize(), 20))
            // Store the data
            calldatacopy(add(pointer, 0x20), 0, sub(calldatasize(), 20))
            // Point the callData to the correct memory location
            callData := pointer
        }

        address payable safeAddress = payable(msg.sender);
        ISafe safe = ISafe(safeAddress);
        require(safe.execTransactionFromModule(to, value, data, 0), "tx failed");
    }

    function enableMyself() public {
        require(myAddress != address(this), "You need to DELEGATECALL, sir");

        // Module cannot be added twice.
        require(modules[myAddress] == address(0), "GS102");
        modules[myAddress] = modules[SENTINEL_MODULES];
        modules[SENTINEL_MODULES] = myAddress;
    }
}
