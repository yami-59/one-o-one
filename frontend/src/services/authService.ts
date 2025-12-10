// Simulation pour la démo (mock)
export const authService = {
  login: async (username: string) => {
    // Simule une requête API
    return new Promise((resolve) => {
      setTimeout(() => {
        const fakeToken = "mock_token_" + Date.now();
        const user = { username, role: username.toLowerCase() === 'admin' ? 'admin' : 'user' };
        
        localStorage.setItem('user_token', fakeToken);
        localStorage.setItem('user_data', JSON.stringify(user));
        
        resolve({ user, token: fakeToken });
      }, 500);
    });
  },
  
  logout: () => {
    localStorage.removeItem('user_token');
    localStorage.removeItem('user_data');
  },

  getCurrentUser: () => {
    const data = localStorage.getItem('user_data');
    return data ?JSON.parse(data) : null;
  }
};