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
type Action = { id: number; title: string; commands: Command[] };
type Category = { id: number; title: string; actions: Action[] };

function MainPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );
  const [selectedActionId, setSelectedActionId] = useState<number | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const result = await CommandService.GetCategories();
        setCategories(result);
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    };

    fetchCategories();
  }, []);

  const selectedCategory =
    categories.find((c) => c.id === selectedCategoryId) ?? null;

  const selectedAction =
    selectedCategory?.actions.find((a) => a.id === selectedActionId) ?? null;

  const handleCategoryChange = (e: SelectChangeEvent<string>) => {
    const id = Number(e.target.value);
    setSelectedCategoryId(id);
    setSelectedActionId(null);
  };

  const handleActionChange = (e: SelectChangeEvent<string>) => {
    const id = Number(e.target.value);
    setSelectedActionId(id);
  };

  return (
    <Container className="app-container" style={{ maxWidth: "100vw" }}>
      {/* Header - samma känsla som AddActionPage */}
      <div className="head-box">
        <h1>Find Action</h1>
      </div>

      {/* Svarta kortet */}
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
        {/* Choose Category */}
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
              value={
                selectedCategoryId !== null ? String(selectedCategoryId) : ""
              }
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

        {/* Choose Action */}
        {selectedCategory && (
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
                value={
                  selectedActionId !== null ? String(selectedActionId) : ""
                }
                onChange={handleActionChange}
              >
                {selectedCategory.actions.map((action) => (
                  <MenuItem key={action.id} value={String(action.id)}>
                    {action.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        )}

        {/* Show Commands */}
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
