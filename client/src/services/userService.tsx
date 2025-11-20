
class userService {

    static async CreateUser(username: string, password: string){
        const apiUrl = "/api/create-user";

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: username,
                    password: password
                })
            });
            if(!response.ok){
                const errorData = await response.json().catch(() => ({message: response.statusText}));
                throw new Error(errorData.message || `login failed with status ${response.status}`)
            }
            const data = await response.json();
            console.log("User Created!", data);
            return data;
        } catch (error){
            console.error("Error during login request: ", error);
            throw error;
        }

    }


}
export default userService;