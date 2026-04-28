//SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

contract Certification {
    address private creator;

    constructor() {
        creator = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == creator, "Only Issuer can call this function.");
        _;
    }

    struct Certificate {
        string candidate_name;
        string org_name;
        string course_name;
        uint256 batch_year;
        uint256 blockNumber; // We store the block number instead
    }

    mapping(bytes32 => Certificate) certificates;

    // The event is the "source of truth" for the Transaction Hash
    event certificateGenerated(bytes32 indexed _certificateId);

    function generateCertificate(
        string memory _id,
        string memory _candidate_name,
        string memory _org_name,
        string memory _course_name,
        uint256 _batch_year
    ) public onlyOwner {
        bytes32 byte_id = keccak256(abi.encodePacked(_id));

        require(
            certificates[byte_id].batch_year == 0,
            "Certificate already exists"
        );
        require(_batch_year >= 2026, "Batch year must be 2026+");

        certificates[byte_id] = Certificate(
            _candidate_name,
            _org_name,
            _course_name,
            _batch_year,
            block.number
        );

        emit certificateGenerated(byte_id);
    }

    function getData(
        string memory _id
    )
        public
        view
        returns (
            string memory,
            string memory,
            string memory,
            uint256,
            uint256 // Returns the Block Number
        )
    {
        bytes32 byte_id = keccak256(abi.encodePacked(_id));
        Certificate memory temp = certificates[byte_id];

        require(temp.batch_year != 0, "No data exists");

        return (
            temp.candidate_name,
            temp.org_name,
            temp.course_name,
            temp.batch_year,
            temp.blockNumber
        );
    }
}
