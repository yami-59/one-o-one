from __future__ import annotations
from fastapi import FastAPI, HTTPException, APIRouter, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, constr
from typing import List, Tuple, Dict, Optional
import random, string, uuid
app = FastAPI(title="WordSearch API")
router = APIRouter()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_methods=["*"],
    allow_headers=["*"],
)

PUZZLES: Dict[str, dict] = {}

LETTER_WEIGHTS = {
    'E':12.02,'T':9.10,'A':8.12,'O':7.68,'I':7.31,'N':6.95,'S':6.28,'R':6.02,'H':5.92,'D':4.32,
    'L':3.98,'U':2.88,'C':2.71,'M':2.61,'F':2.30,'Y':2.11,'W':2.09,'G':2.03,'P':1.82,'B':1.49,
    'V':1.11,'K':0.69,'X':0.17,'Q':0.11,'J':0.10,'Z':0.07
}

DIRECTIONS = [
    (0, 1),   # →
    (0, -1),  # ←
    (1, 0),   # ↓
    (-1, 0),  # ↑
    (1, 1),   # ↘
    (1, -1),  # ↙
    (-1, 1),  # ↗
    (-1, -1), # ↖
]

# ----------------------------
# Data Models
# ----------------------------
class GenerateRequest(BaseModel):
    words: List[constr(min_length=1)] = Field(..., description="list of words to be placed")
    size: Optional[int] = Field(None, ge=4, le=64, description="grid size")
    allow_diagonals: bool = True
    allow_reverse: bool = True                   # allow reversed words
    fill_strategy: str = Field("weighted", pattern="^(uniform|weighted)$")
    seed: Optional[int] = Field(None, description="fixed random seed for reproducibility")
    uppercase: bool = True

class GenerateResponse(BaseModel):
    puzzle_id: str
    size: int
    grid: List[str]          
    words: List[str]         
    seed: Optional[int]

class CheckRequest(BaseModel):
    word: constr(min_length=1)
    start: Tuple[int, int]   # (row, col) 0-based
    end: Tuple[int, int]

class CheckResponse(BaseModel):
    valid: bool
    path: Optional[List[Tuple[int,int]]] = None  

class SolutionResponse(BaseModel):
    words: Dict[str, List[Tuple[int,int]]]

# ----------------------------
# Functions
# ----------------------------
def sanitize_words(words: List[str], uppercase: bool = True) -> List[str]:
    out = []
    for w in words:
        w = w.strip()
        if uppercase:
            w = w.upper()
        # Keep only A-Z characters
        w = "".join(ch for ch in w if ch in string.ascii_letters).upper()
        if w:
            out.append(w)
    if not out:
        raise HTTPException(400, "words list is empty or invalid")
    return list(dict.fromkeys(out))  # remove duplicates

def choose_size(words: List[str], requested: Optional[int]) -> int:
    maxlen = max(len(w) for w in words)
    if requested is None:
        # automatically choose grid size
        return max( maxlen, min( maxlen + 2, 16) )
    if requested < maxlen:
        raise HTTPException(400, f"size too small, must be >= longest word ({maxlen})")
    return requested

def random_letter(strategy: str) -> str:
    if strategy == "uniform":
        return random.choice(string.ascii_uppercase)
    # weighted
    letters = list(LETTER_WEIGHTS.keys())
    weights = list(LETTER_WEIGHTS.values())
    return random.choices(letters, weights=weights, k=1)[0]

def dir_set(allow_diagonals: bool, allow_reverse: bool):
    dirs = []
    base = [(0,1),(1,0)]
    if allow_diagonals:
        base += [(1,1),(1,-1)]
    dirs = []
    for dr, dc in base:
        dirs.append((dr, dc))
        if allow_reverse:
            dirs += [(-dr, -dc)]
    if (0,-1) not in dirs and allow_reverse: dirs.append((0,-1))
    if (-1,0) not in dirs and allow_reverse: dirs.append((-1,0))
    seen = set()
    uniq = []
    for d in dirs:
        if d not in seen and d != (0,0):
            uniq.append(d)
            seen.add(d)
    return uniq

def can_place(grid, r, c, dr, dc, word):
    n = len(grid)
    rr, cc = r, c
    for ch in word:
        if not (0 <= rr < n and 0 <= cc < n):
            return False
        if grid[rr][cc] is not None and grid[rr][cc] != ch:
            return False
        rr += dr
        cc += dc
    return True

def place_word(grid, r, c, dr, dc, word):
    coords = []
    rr, cc = r, c
    for ch in word:
        grid[rr][cc] = ch
        coords.append((rr,cc))
        rr += dr
        cc += dc
    return coords

def generate_grid(words: List[str], size: int, allow_diagonals: bool, allow_reverse: bool, fill_strategy: str) -> Tuple[List[str], Dict[str,List[Tuple[int,int]]]]:
    words_sorted = sorted(words, key=len, reverse=True)
    n = size
    grid: List[List[Optional[str]]] = [[None for _ in range(n)] for _ in range(n)]
    placements: Dict[str, List[Tuple[int,int]]] = {}
    dirs = dir_set(allow_diagonals, allow_reverse)

    for w in words_sorted:
        placed = False
        attempts = 2000
        while attempts > 0 and not placed:
            attempts -= 1
            dr, dc = random.choice(dirs)
            r_min, r_max = (0, n-1)
            c_min, c_max = (0, n-1)
            if dr == 1:  r_max = n - len(w)
            if dr == -1: r_min = len(w) - 1
            if dc == 1:  c_max = n - len(w)
            if dc == -1: c_min = len(w) - 1
            if r_min > r_max or c_min > c_max:
                continue
            r = random.randint(r_min, r_max)
            c = random.randint(c_min, c_max)
            if can_place(grid, r, c, dr, dc, w):
                coords = place_word(grid, r, c, dr, dc, w)
                placements[w] = coords
                placed = True
        if not placed:
            raise HTTPException(422, f"放置失败：无法在 {n}x{n} 网格中放入单词 {w}。请增大 size 或允许更多方向/反向。")

    # fill remaining empty cells
    for i in range(n):
        for j in range(n):
            if grid[i][j] is None:
                grid[i][j] = random_letter(fill_strategy)

    # convert to List[str]
    rows = ["".join(ch for ch in row) for row in grid]
    return rows, placements

def straight_path(start: Tuple[int,int], end: Tuple[int,int]) -> Optional[List[Tuple[int,int]]]:
    r1,c1 = start
    r2,c2 = end
    dr = r2 - r1
    dc = c2 - c1
    def sign(x): return (x>0) - (x<0)
    sdr, sdc = sign(dr), sign(dc)
    if dr == 0 and dc == 0:
        return None
    if not (sdr in (-1,0,1) and sdc in (-1,0,1)):
        return None
    if sdr != 0 and sdc != 0 and abs(dr) != abs(dc):
        return None
    path = [(r1, c1)]
    rr, cc = r1, c1
    while (rr,cc) != (r2, c2):
        rr += sdr
        cc += sdc
        path.append((rr,cc))
    return path

# ----------------------------
# Routes
# ----------------------------
@app.post("/puzzles", response_model=GenerateResponse)
def create_puzzle(req: GenerateRequest):
    if req.seed is not None:
        random.seed(req.seed)
    else:
        req.seed = random.randrange(1, 2**31 - 1)
        random.seed(req.seed)

    words = sanitize_words(req.words, uppercase=req.uppercase)
    size = choose_size(words, req.size)

    grid, placements = generate_grid(
        words=words,
        size=size,
        allow_diagonals=req.allow_diagonals,
        allow_reverse=req.allow_reverse,
        fill_strategy=req.fill_strategy
    )

    print("\n=== WordSearch Puzzle ===")
    for row in grid:
        print(" ".join(row))
    print("==========================\n")


    puzzle_id = str(uuid.uuid4())
    PUZZLES[puzzle_id] = {
        "size": size,
        "grid": grid,
        "words": words,
        "placements": placements,
        "seed": req.seed
    }
    return GenerateResponse(puzzle_id=puzzle_id, size=size, grid=grid, words=words, seed=req.seed)

@app.get("/puzzles/{puzzle_id}", response_model=GenerateResponse)
def get_puzzle(puzzle_id: str):
    pz = PUZZLES.get(puzzle_id)
    if not pz:
        raise HTTPException(404, "puzzle does not exist")
    return GenerateResponse(
        puzzle_id=puzzle_id,
        size=pz["size"],
        grid=pz["grid"],
        words=pz["words"],
        seed=pz["seed"]
    )

@app.get("/puzzles/{puzzle_id}/solution", response_model=SolutionResponse)
def get_solution(puzzle_id: str):
    pz = PUZZLES.get(puzzle_id)
    if not pz:
        raise HTTPException(404, "puzzle does not exist")
    return SolutionResponse(words=pz["placements"])

@app.post("/puzzles/{puzzle_id}/check", response_model=CheckResponse)
def check_word(puzzle_id: str, req: CheckRequest):
    pz = PUZZLES.get(puzzle_id)
    if not pz:
        raise HTTPException(404, "puzzle does not exist")
    word = req.word.strip().upper()
    if word not in pz["words"]:
        return CheckResponse(valid=False)

    path = straight_path(req.start, req.end)
    if not path:
        return CheckResponse(valid=False)

    # matching
    n = pz["size"]
    if any(not (0 <= r < n and 0 <= c < n) for r,c in path):
        return CheckResponse(valid=False)
    letters = "".join(pz["grid"][r][c] for r,c in path)

    if letters == word:
        return CheckResponse(valid=True, path=path)
    if letters[::-1] == word:
        return CheckResponse(valid=True, path=list(reversed(path)))

    return CheckResponse(valid=False)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("wordsearch:app", host="0.0.0.0", port=8000, reload=True)
