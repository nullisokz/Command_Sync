import { useState } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Divider,
} from "@mui/material";
import SuccessModal from "../../components/Modals/SuccessModal";
import { useNavigate } from "react-router-dom"; // Behöver installeras: npm install react-router-dom
import GoogleIcon from "@mui/icons-material/Google";
import loginService  from "../../services/loginService"
import "./LoginPage.css";
import userService from "../../services/userService";


function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [createMode, setCreateMode] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);
  const navigate = useNavigate(); // Hook från react-router-dom


  const handleEmailPasswordLogin = async (username: string, password: string) => {
    setError("");
    setLoading(true);

    if (!username || !password) {
      setError("Vänligen fyll i både e-post och lösenord.");
      setLoading(false);
      return;
    }
   
    try {
      const success = await loginService.Login(username, password);
      if (success) {
        console.log("LOGGED IN")
        navigate("/"); // Se till att din MainPage har sökvägen '/main' i din router
      } else {
        setError("Inloggning misslyckades. Kontrollera dina uppgifter.");
      }
    } catch (err) {
      setError("Ett oväntat fel uppstod vid inloggning.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // const handleGoogleLogin = async () => {
  //   setError("");
  //   setLoading(true);

  //   try {
  //     const success = await simulateLogin(undefined, undefined, true);
  //     if (success) {
  //       // Vid lyckad inloggning, navigera till MainPage
  //       navigate("/main");
  //     } else {
  //       setError("Inloggning med Google misslyckades.");
  //     }
  //   } catch (err) {
  //     setError("Ett oväntat fel uppstod vid inloggning med Google.");
  //     console.error(err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

    const handleCreateUser = async (username:string,password:string,password2:string) => {
      setError("");
      setLoading(true);

      if(password === password2){

      try{
        const success = await userService.CreateUser(username, password)
        if(success){
          setLoading(false)
          setIsSuccessModalOpen(true)
          setTimeout(() => {
                setIsSuccessModalOpen(false); 
                setCreateMode(false); 
                
                // Navigate the user to the login page
                navigate("/login");
                
            }, 2000);
        }
      }
      catch(error){
        throw error;
      }
    }else{
      return;
    }
  }

  const handleCloseSuccessModal = () => {
    setIsSuccessModalOpen(false);
    // 3. Navigate to the login page after the user acknowledges the success message
    navigate("/login"); 
};

  return (
    <Container className="app-container" style={{ maxWidth: "100vw" }}>
      <div className="head-box">
        <Typography variant="h3" component="h1" sx={{ color: "white" }}>
          Välkommen
        </Typography>
      </div>
      {!createMode ? 
      <Box
        className="login-card"
        sx={{
          maxWidth: 420,
          width: "100%",
          margin: "0 auto",
          padding: "2rem",
          borderRadius: "16px",
          backgroundColor: "rgba(15,15,20,0.96)",
          boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
        }}
      >
        <Typography variant="h5" component="h2" sx={{ color: "white", textAlign: "center", fontWeight: 600 }}>
          Logga in
        </Typography>

        {/* --- Formulär för E-post och Lösenord --- */}
        <TextField
          label="E-post"
          variant="outlined"
          fullWidth
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          sx={{ input: { color: 'white' }, label: { color: 'rgba(255, 255, 255, 0.7)' }, fieldset: { borderColor: 'rgba(255, 255, 255, 0.3)' } }}
          InputLabelProps={{ shrink: true }}
          InputProps={{ style: { color: 'white' } }}
        />
        <TextField
          label="Lösenord"
          variant="outlined"
          type="password"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ input: { color: 'white' }, label: { color: 'rgba(255, 255, 255, 0.7)' }, fieldset: { borderColor: 'rgba(255, 255, 255, 0.3)' } }}
          InputLabelProps={{ shrink: true }}
          InputProps={{ style: { color: 'white' } }}
        />

        {error && (
          <Typography color="error" sx={{ textAlign: "center" }}>
            {error}
          </Typography>
        )}

        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={() => handleEmailPasswordLogin(username, password)}
          disabled={loading}
          sx={{
            padding: "0.75rem",
            fontSize: "1rem",
            backgroundColor: "#4caf50", // Grön färg för att matcha en "action"-knapp
            "&:hover": {
              backgroundColor: "#388e3c",
            },
          }}
        >
          {loading ? "Loggar in..." : "Logga in"}
        </Button>

        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={() => setCreateMode(true)}
          disabled={loading}
          sx={{
            padding: "0.75rem",
            fontSize: "1rem",
            backgroundColor: "#d8d406ff", // Grön färg för att matcha en "action"-knapp
            "&:hover": {
              backgroundColor: "#5f6903ff",
            },
          }}
          >{loading ? "Directing..." : "Create user"}

          </Button>

        {/* --- Avdelare för Logga in med Google --- */}
        <Divider sx={{ color: "rgba(255, 255, 255, 0.5)", margin: "0.5rem 0" }}>
          ELLER
        </Divider>

        {/* --- Logga in med Google-knapp --- */}
        <Button
          variant="outlined"
          fullWidth
          //onClick={handleGoogleLogin}
          disabled={loading}
          startIcon={<GoogleIcon />}
          sx={{
            padding: "0.75rem",
            fontSize: "1rem",
            color: "white",
            borderColor: "rgba(255, 255, 255, 0.3)",
            "&:hover": {
              borderColor: "white",
              backgroundColor: "rgba(255, 255, 255, 0.08)",
            },
          }}
        >
          Logga in med Google
        </Button>
      </Box>

      : 

      <Box
        className="login-card"
        sx={{
          maxWidth: 420,
          width: "100%",
          margin: "0 auto",
          padding: "2rem",
          borderRadius: "16px",
          backgroundColor: "rgba(15,15,20,0.96)",
          boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
        }}
      >
        <Typography variant="h5" component="h2" sx={{ color: "white", textAlign: "center", fontWeight: 600 }}>
          Logga in
        </Typography>

        {/* --- Formulär för E-post och Lösenord --- */}
        <TextField
          label="E-post"
          variant="outlined"
          fullWidth
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          sx={{ input: { color: 'white' }, label: { color: 'rgba(255, 255, 255, 0.7)' }, fieldset: { borderColor: 'rgba(255, 255, 255, 0.3)' } }}
          InputLabelProps={{ shrink: true }}
          InputProps={{ style: { color: 'white' } }}
        />
        <TextField
          label="Lösenord"
          variant="outlined"
          type="password"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ input: { color: 'white' }, label: { color: 'rgba(255, 255, 255, 0.7)' }, fieldset: { borderColor: 'rgba(255, 255, 255, 0.3)' } }}
          InputLabelProps={{ shrink: true }}
          InputProps={{ style: { color: 'white' } }}
        />
        <TextField
          label="Upprepa Lösenord"
          variant="outlined"
          type="password"
          fullWidth
          value={password2}
          onChange={(e) => setPassword2(e.target.value)}
          sx={{ input: { color: 'white' }, label: { color: 'rgba(255, 255, 255, 0.7)' }, fieldset: { borderColor: 'rgba(255, 255, 255, 0.3)' } }}
          InputLabelProps={{ shrink: true }}
          InputProps={{ style: { color: 'white' } }}
        />

        {error && (
          <Typography color="error" sx={{ textAlign: "center" }}>
            {error}
          </Typography>
        )}

        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={() => handleCreateUser(username, password, password2)}
          disabled={loading}
          sx={{
            padding: "0.75rem",
            fontSize: "1rem",
            backgroundColor: "#4caf50", // Grön färg för att matcha en "action"-knapp
            "&:hover": {
              backgroundColor: "#388e3c",
            },
          }}
        >
          {loading ? "Loading..." : "Skapa användare"}
        </Button>
        <SuccessModal 
      open={isSuccessModalOpen} 
      onClose={handleCloseSuccessModal} // Use the new handler here
      userName={username} 
    />
        </Box> }
    </Container>
    
  );
}

export default LoginPage;