import struct
import re
from .models import TokenDictionary

def tokenize_lossless(text: str) -> list[str]:

    # Pattern: \w+ (words/digits), [^\w\s] (symbols/punctuation), \s+ (spaces/newlines)
    # Filter out empty strings to keep the database clean
    return [t for t in re.split(r'(\w+|[^\w\s]|\s+)', text) if t]

def compress_to_binary(text: str) -> bytes:

    tokens = tokenize_lossless(text)
    indices = []
    
    for token in tokens:
        # Automated Engine: If a token is new, it's created on the fly in the DB.
        # The auto-increment ID acts as our unique uint16 index.
        token_obj, created = TokenDictionary.objects.get_or_create(word=token)
        
        # Architecture Guard: uint16 supports values up to 65535.
        if token_obj.id > 65535:
            # If the dictionary exceeds uint16, we must upgrade 'H' to 'I' (uint32)
            raise OverflowError(f"Global Dictionary Limit Reached: Token ID {token_obj.id} > 65535")
            
        indices.append(token_obj.id)
        
    # Pack indices into binary bytes. 
    # 'H' format = unsigned short (2 bytes / uint16 per token).
    binary_data = struct.pack(f'{len(indices)}H', *indices)
    return binary_data

def restore_from_binary(binary_data: bytes) -> str:
    """
    Phase 1, Task 2: Lossless Restoration.
    Reconstitutes binary data back into 100% accurate original text.
    """
    # 1. Unpack binary data
    count = len(binary_data) // 2 # Each uint16 is 2 bytes
    indices = struct.unpack(f'{count}H', binary_data)
    
    # 2. Optimized Retrieval: Fetch all tokens in a single SQL query
    tokens_db = TokenDictionary.objects.filter(id__in=indices)
    
    # Map IDs to words for fast assembly
    token_map = {t.id: t.word for t in tokens_db}
    
    # 3. Final Assembly (Deep Retrieval)
    restored_tokens = []
    for idx in indices:
        word = token_map.get(idx, "[ERROR: LOST_TOKEN]")
        restored_tokens.append(word)
        
    # Join with empty string because spaces/newlines were saved as separate tokens!
    return "".join(restored_tokens)