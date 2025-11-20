
class loginService {

static async Login(username:string, password:string): Promise<any> {
    const apiUrl = "/api/login";

    try {
        const response = await fetch(apiUrl, {
            method: 'POST', // Use POST method for sending data
            headers: {
                // Inform the server that the request body is JSON
                'Content-Type': 'application/json',
            },
            // Convert the TypeScript object into a JSON string for the body
            body: JSON.stringify({
                name: username,
                password: password
            })
        });

        // Check if the response status is not OK (e.g., 401 Unauthorized, 500 Server Error)
        if (!response.ok) {
            // Throw an error with the status text or a custom message
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(errorData.message || `Login failed with status: ${response.status}`);
        }

        // Parse and return the JSON response (e.g., a JWT token or user data)
        const data = await response.json();
        console.log("Login successful:", data);
        return data;

    } catch (error) {
        console.error("Error during login request:", error);
        // Re-throw the error so the calling code can handle the failure
        throw error;
    }
}
}
export default loginService;
