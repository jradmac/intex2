// AuthAPI.ts - Functions for authentication

const API_URL = "http://localhost:5000/api/auth"; // Path to auth controller

interface LogoutRequest {
  sessionId: string;
}

interface LogoutResponse {
  success: boolean;
}

// Helper to get the session ID from localStorage
const getSessionId = (): string | null => {
  return localStorage.getItem('sessionId');
};

export const logout = async (): Promise<LogoutResponse> => {
  try {
    const sessionId = getSessionId();
    
    if (!sessionId) {
      throw new Error('No active session found');
    }

    const response = await fetch(`${API_URL}/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify({ sessionId } as LogoutRequest)
    });

    if (!response.ok) {
      throw new Error(`Logout failed: ${response.status} ${response.statusText}`);
    }

    // Clear auth data from localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('sessionId');
    localStorage.removeItem('user');
    
    return await response.json();
  } catch (error) {
    console.error("Error during logout:", error);
    throw error;
  }
};