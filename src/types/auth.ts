export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  data: {
    id: string;
    name: string;
    email: string;
  };
}

export interface checkAuthStatus {
    data : {
        authenticated : boolean
    }
}
