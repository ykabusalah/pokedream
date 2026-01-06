"""
PokéDream Name Filter
Filters inappropriate trainer names.
"""

import re

# Common inappropriate words/patterns (keep this list private in production)
BLOCKED_PATTERNS = [
    # Slurs and hate speech (abbreviated patterns)
    r'\bn[i1]gg',
    r'\bf[a@]g',
    r'\bk[i1]ke',
    r'\bch[i1]nk',
    r'\bsp[i1]c',
    r'\bwetback',
    r'\btr[a@]nn',
    
    # Profanity
    r'\bf+u+c+k',
    r'\bs+h+[i1]+t+',
    r'\ba+s+s+h+o+l+e',
    r'\bb[i1]tch',
    r'\bc+u+n+t',
    r'\bd[i1]ck',
    r'\bcock',
    r'\bpussy',
    r'\bwh[o0]re',
    r'\bslut',
    
    # Sexual
    r'\bporn',
    r'\bsex',
    r'\brape',
    r'\bpedo',
    r'\bmolest',
    
    # Violence
    r'\bkill\s*(yo)?u',
    r'\bmurder',
    r'\bsuicid',
    
    # Leet speak variants
    r'\b[a@][s$][s$]',
    r'\bp[e3]n[i1][s$]',
]

# Compile patterns for efficiency
COMPILED_PATTERNS = [re.compile(p, re.IGNORECASE) for p in BLOCKED_PATTERNS]


def is_name_appropriate(name: str) -> tuple[bool, str]:
    """
    Check if a trainer name is appropriate.
    
    Returns:
        (is_valid, reason) - True if appropriate, False with reason if not
    """
    if not name or not name.strip():
        return False, "Name cannot be empty"
    
    name = name.strip()
    
    # Length check
    if len(name) < 2:
        return False, "Name must be at least 2 characters"
    
    if len(name) > 20:
        return False, "Name must be 20 characters or less"
    
    # Character check - allow letters, numbers, spaces, and basic punctuation
    if not re.match(r'^[\w\s\-\.\']+$', name):
        return False, "Name contains invalid characters"
    
    # Check against blocked patterns
    for pattern in COMPILED_PATTERNS:
        if pattern.search(name):
            return False, "Name contains inappropriate content"
    
    return True, "OK"


def sanitize_name(name: str) -> str:
    """
    Sanitize a name by removing extra whitespace and limiting length.
    Does NOT filter profanity - use is_name_appropriate() first.
    """
    if not name:
        return "Trainer"
    
    # Strip and collapse whitespace
    name = ' '.join(name.split())
    
    # Limit length
    if len(name) > 20:
        name = name[:20].strip()
    
    return name if name else "Trainer"


# Test
if __name__ == "__main__":
    test_names = [
        "Ash",
        "Red",
        "Gary Oak",
        "xX_Shadow_Xx",
        "Player 1",
        "",
        "a",
        "ThisNameIsWayTooLongForOurSystem",
        "Test<script>",
    ]
    
    print("Name Validation Tests:")
    print("-" * 40)
    for name in test_names:
        valid, reason = is_name_appropriate(name)
        status = "✓" if valid else "✗"
        print(f"{status} '{name}' -> {reason}")