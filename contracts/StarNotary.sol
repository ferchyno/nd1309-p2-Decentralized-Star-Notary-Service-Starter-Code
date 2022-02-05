pragma solidity >=0.4.24;

//Importing openzeppelin-solidity ERC-721 implemented Standard
import "../node_modules/openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";

// StarNotary Contract declaration inheritance the ERC721 openzeppelin implementation
contract StarNotary is ERC721 {

    bytes16 private constant _HEX_SYMBOLS = "0123456789abcdef";

    // Star data
    struct Star {
        string name;
        string symbol;
    }

    // Task 1: Add a name and symbol properties
    // name: Is a short name to your token
    // symbol: Is a short string like 'USD' -> 'American Dollar'
    string public starName;
    string public starSymbol;

    constructor(string memory _name, string memory _symbol) public {
        starName = _name;
        starSymbol = _symbol;
    }

    // mapping the Star with the Owner Address
    mapping(uint256 => Star) public tokenIdToStarInfo;
    // mapping the TokenId and price
    mapping(uint256 => uint256) public starsForSale;


    // -------------- .: Private functions :. --------------

    // Function that allows you to convert an address into a payable address
    function _make_payable(address x) internal pure returns (address payable) {
        return address(uint160(x));
    }

    // Parse unint to string  (from String.sol utils)
    function toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    // Converts a `uint256` to its ASCII `string` hexadecimal representation. (from String.sol utils)
    function toHexString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0x00";
        }
        uint256 temp = value;
        uint256 length = 0;
        while (temp != 0) {
            length++;
            temp >>= 8;
        }
        return toHexString(value, length);
    }

    // Converts a `uint256` to its ASCII `string` hexadecimal representation with fixed length. (from String.sol utils)
    function toHexString(uint256 value, uint256 length) internal pure returns (string memory) {
        bytes memory buffer = new bytes(2 * length + 2);
        buffer[0] = "0";
        buffer[1] = "x";
        for (uint256 i = 2 * length + 1; i > 1; --i) {
            buffer[i] = _HEX_SYMBOLS[value & 0xf];
            value >>= 4;
        }
        require(value == 0, "Strings: hex length insufficient");
        return string(buffer);
    }

    // -------------- .: Public functions :. --------------

    // Create Star using the Struct
    function createStar(string memory _name, string memory _symbol, uint256 _tokenId) public { // Passing the name and tokenId as a parameters
        Star memory newStar = Star(_name, _symbol); // Star is an struct so we are creating a new Star
        tokenIdToStarInfo[_tokenId] = newStar; // Creating in memory the Star -> tokenId mapping
        _mint(msg.sender, _tokenId); // _mint assign the the star with _tokenId to the sender address (ownership)
    }

    // Putting an Star for sale (Adding the star tokenid into the mapping starsForSale, first verify that the sender is the owner)
    function putStarUpForSale(uint256 _tokenId, uint256 _price) public {
        require(ownerOf(_tokenId) == msg.sender, "You can't sale the Star you don't owned");
        starsForSale[_tokenId] = _price;
    }

    function buyStar(uint256 _tokenId) public  payable {
        require(starsForSale[_tokenId] > 0, "The Star should be up for sale");
        uint256 starCost = starsForSale[_tokenId];
        address ownerAddress = ownerOf(_tokenId);
        require(msg.value > starCost, "You need to have enough Ether");
        _transferFrom(ownerAddress, msg.sender, _tokenId); // We can't use _addTokenTo or_removeTokenFrom functions, now we have to use _transferFrom
        address payable ownerAddressPayable = _make_payable(ownerAddress); // We need to make this conversion to be able to use transfer() function to transfer ethers
        ownerAddressPayable.transfer(starCost);
        if(msg.value > starCost) {
            msg.sender.transfer(msg.value - starCost);
        }
    }

    // Task 2: Get Star Info
    function lookUptokenIdToStarInfo (uint _tokenId) public view returns (string memory) {
        // Get star indo
        Star memory newStar = tokenIdToStarInfo[_tokenId];

        // Prepare params
        string memory s_tokenId = toString(_tokenId);
        string memory s_price = toString(starsForSale[_tokenId]);
        address a_ownerAddress = ownerOf(_tokenId);
        string memory s_ownerAddress = toHexString(uint256(a_ownerAddress));

        // Prepare response
        return string(abi.encodePacked("Token: ", s_tokenId, ", Name: ", newStar.symbol, " - ", newStar.name, ", Price: ", s_price, ", Account: ", s_ownerAddress));
    }

    function getOwnerOf (uint _tokenId) public view returns (string memory) {
        address a_ownerAddress = ownerOf(_tokenId);
        string memory s_ownerAddress = toHexString(uint256(a_ownerAddress));

        return s_ownerAddress;
    }

    // Task 3: Exchange Stars
    function exchangeStars(uint256 _tokenId1, uint256 _tokenId2) public {
        //3. Get the owner of the two tokens (ownerOf(_tokenId1), ownerOf(_tokenId1)
        address previousOwnerAddressToken1 = ownerOf(_tokenId1);
        address previousOwnerAddressToken2 = ownerOf(_tokenId2);

        //1. Passing to star tokenId you will need to check if the owner of _tokenId1 or _tokenId2 is the sender
        if (previousOwnerAddressToken1 == msg.sender || previousOwnerAddressToken2 == msg.sender) {
            //4. Use _transferFrom function to exchange the tokens.
            _transferFrom(previousOwnerAddressToken1, previousOwnerAddressToken2, _tokenId1);
            _transferFrom(previousOwnerAddressToken2, previousOwnerAddressToken1, _tokenId2);
        }

        //2. You don't have to check for the price of the token (star)
    }

    // Task 4: Transfer Stars
    function transferStar(address _to, uint256 _tokenId) public {
        //1. Check if the sender is the ownerOf(_tokenId)
        address ownerAddress = ownerOf(_tokenId);

        if (ownerAddress == msg.sender) {
            //2. Use the transferFrom(from, to, tokenId); function to transfer the Star
            _transferFrom(ownerAddress, _to, _tokenId);
        }
    }
}