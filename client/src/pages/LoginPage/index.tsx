import { useState } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Divider,
} from "@mui/material";
import { useNavigate } from "react-router-dom"; // Behöver installeras: npm install react-router-dom
import GoogleIcon from "@mui/icons-material/Google";
import "./LoginPage.css";

// Simulerad logik för inloggning. Ersätt med din riktiga backend-logik sen.
const simulateLogin = async (
  email?: string,
  password?: string,
  isGoogleLogin: boolean = false
) => {
  return new Promise<boolean>((resolve) => {
    setTimeout(() => {
      // Simulerar lyckad inloggning efter 1 sekund
      resolve(true);
    }, 1000);
  });
};

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate(); // Hook från react-router-dom

  const handleEmailPasswordLogin = async () => {
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("Vänligen fyll i både e-post och lösenord.");
      setLoading(false);
      return;
    }

    try {
      const success = await simulateLogin(email, password);
      if (success) {
        // Vid lyckad inloggning, navigera till MainPage
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

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      const success = await simulateLogin(undefined, undefined, true);
      if (success) {
        // Vid lyckad inloggning, navigera till MainPage
        navigate("/main");
      } else {
        setError("Inloggning med Google misslyckades.");
      }
    } catch (err) {
      setError("Ett oväntat fel uppstod vid inloggning med Google.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="app-container" style={{ maxWidth: "100vw" }}>
      <div className="head-box">
        <Typography variant="h3" component="h1" sx={{ color: "white" }}>
          Välkommen
        </Typography>
      </div>

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
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
          onClick={handleEmailPasswordLogin}
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

        {/* --- Avdelare för Logga in med Google --- */}
        <Divider sx={{ color: "rgba(255, 255, 255, 0.5)", margin: "0.5rem 0" }}>
          ELLER
        </Divider>

        {/* --- Logga in med Google-knapp --- */}
        <Button
          variant="outlined"
          fullWidth
          onClick={handleGoogleLogin}
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
    </Container>
  );
}

export default LoginPage;