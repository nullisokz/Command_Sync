import { useEffect, useState } from "react";
import "./MainPage.css";
import {
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Container,
  Typography,
} from "@mui/material";
import CommandService from "../../services/commandService";
import type { SelectChangeEvent } from "@mui/material";
import logo from "../../assets/logo.png";

type Command = { id: number; description: string; code: string };
type Action = {
  id: number;
  category: Category;
  title: string;
  commands: Command[];
};
type Category = { id: number; title: string };

function MainPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [actions, setActions] = useState<Action[]>([]);
  const [selectedAction, setSelectedAction] = useState<Action>();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedActionId, setSelectedActionId] = useState<string>("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const result = await CommandService.GetCategories();
        const uniqueByTitle = (cats: Category[]): Category[] => {
          const seen = new Set<string>();
          return cats.filter((c) => {
            if (seen.has(c.title)) return false;
            seen.add(c.title);
            return true;
          });
        };

        const uniqueCategories = uniqueByTitle(result);
        setCategories(uniqueCategories);
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryChange = async (e: SelectChangeEvent<string>) => {
    const value = e.target.value;
    setSelectedCategoryId(value);

    const id = Number(value);
    const result = await CommandService.GetActionsByCategory(id);

    setActions(result);
    setSelectedAction(undefined);
    setSelectedActionId("");
  };

  const handleActionChange = (e: SelectChangeEvent<string>) => {
    const value = e.target.value;
    setSelectedActionId(value);

    const id = Number(value);
    const found = actions.find((a) => a.id === id);
    setSelectedAction(found);
  };

  return (
    <Container className="app-container" style={{ maxWidth: "100vw" }}>
      <div className="head-box">
        <h1>Find Action</h1>
      </div>
      <Box
        className="form-card"
        sx={{
          maxWidth: 720,
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
        <div
          style={{
            maxWidth: 420,
            width: "100%",
            margin: "0 auto 1.5rem",
          }}
        >
          <FormControl fullWidth className="custom-select">
            <InputLabel id="category-label">Choose Category</InputLabel>
            <Select
              labelId="category-label"
              label="Choose Category"
              value={selectedCategoryId}
              onChange={handleCategoryChange}
            >
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={String(cat.id)}>
                  {cat.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        {actions.length > 0 && (
          <div
            style={{
              maxWidth: 420,
              width: "100%",
              margin: "0 auto 1.5rem",
            }}
          >
            <FormControl fullWidth className="custom-select">
              <InputLabel id="action-label">Choose Action</InputLabel>
              <Select
                labelId="action-label"
                label="Choose Action"
                value={selectedActionId}
                onChange={handleActionChange}
              >
                {actions.map((action) => (
                  <MenuItem key={action.id} value={String(action.id)}>
                    {action.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        )}

        {selectedAction && (
          <div
            className="command-detail"
            style={{ maxWidth: 720, margin: "0 auto" }}
          >
            <Typography
              variant="h6"
              sx={{ marginBottom: ".75rem", fontWeight: 600 }}
            >
              {selectedAction.title}
            </Typography>

            {selectedAction.commands.map((step, i) => (
              <div key={step.id ?? i} style={{ marginBottom: "1rem" }}>
                <div style={{ opacity: 0.9, marginBottom: ".25rem" }}>
                  <strong>Step {i + 1}:</strong> {step.description}
                </div>
                <pre className="code-block">{step.code}</pre>
              </div>
            ))}
          </div>
        )}
      </Box>
    </Container>
  );
}

export default MainPage;
