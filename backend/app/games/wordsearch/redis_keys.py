def redis_state_key(game_id:str): return f"game:{game_id}:state"
def redis_solution_key(game_id:str): return f"game:{game_id}:solution"