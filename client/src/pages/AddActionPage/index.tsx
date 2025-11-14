import { useEffect, useState, useMemo } from "react";
import "./AddActionPage.css";
import logo from "../../assets/logo.png";
import {
  Container,
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  Autocomplete,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import CommandService from "../../services/commandService";

type Command = { id: number; description: string; code: string };
type Action = { id: number; title: string; commands: Command[] };
type Category = { id: number; title: string; actions: Action[] };

// 0 = Category, 1 = Action, 2 = Commands
type StepIndex = 0 | 1 | 2;

function AddActionPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [allCommands, setAllCommands] = useState<Command[]>([]);

  const [activeStep, setActiveStep] = useState<StepIndex>(0);

  // Steg 1: kategori
  const [categoryInput, setCategoryInput] = useState("");
  const [categoryMode, setCategoryMode] = useState<"existing" | "new" | null>(
    null
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );
  const [newCategoryTitle, setNewCategoryTitle] = useState("");

  // Steg 2: action
  const [actionTitle, setActionTitle] = useState("");

  // Steg 3: commands
  const [selectedCommandIds, setSelectedCommandIds] = useState<number[]>([]);
  const [newCommandDescription, setNewCommandDescription] = useState("");
  const [newCommandCode, setNewCommandCode] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const trimLower = (v: string) => v.trim().toLowerCase();

  const categoryTitleExists = (title: string) =>
    categories.some((c) => trimLower(c.title) === trimLower(title));

  const actionTitleExists = (title: string) =>
    categories.some((c) =>
      c.actions.some((a) => trimLower(a.title) === trimLower(title))
    );

  const commandDescriptionExists = (description: string) =>
    allCommands.some(
      (cmd) => trimLower(cmd.description) === trimLower(description)
    );

  const selectedCategory =
    selectedCategoryId != null
      ? categories.find((c) => c.id === selectedCategoryId) ?? null
      : null;

  // Hämta kategorier + commands
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cats, cmds] = await Promise.all([
          CommandService.GetCategories(), // -> Category[]
          CommandService.GetCommands(), // -> Command[]
        ]);
        setCategories(cats);
        setAllCommands(cmds);
      } catch (err) {
        console.error("Failed to load data", err);
      }
    };
    fetchData();
  }, []);

  // Unika commands baserat på (description + code)
  const uniqueCommands = useMemo(() => {
    const map = new Map<string, Command>();
    for (const cmd of allCommands) {
      const key =
        cmd.description.trim().toLowerCase() +
        "|" +
        cmd.code.trim();
      if (!map.has(key)) {
        map.set(key, cmd);
      }
    }
    return Array.from(map.values());
  }, [allCommands]);

  // ===== Steg 1: Category Next =====
  const handleCategoryNext = () => {
    const value = categoryInput.trim();
    const newErrors: Record<string, string> = {};

    if (!value) {
      newErrors.category = "Välj en kategori eller skriv in ett namn.";
    } else {
      const existing = categories.find(
        (c) => trimLower(c.title) === trimLower(value)
      );
      if (existing) {
        setCategoryMode("existing");
        setSelectedCategoryId(existing.id);
        setNewCategoryTitle("");
      } else {
        if (categoryTitleExists(value)) {
          newErrors.category = "Den kategorin finns redan.";
        } else {
          setCategoryMode("new");
          setNewCategoryTitle(value);
          setSelectedCategoryId(null);
        }
      }
    }

    setErrors((prev) => ({ ...prev, category: newErrors.category || "" }));

    if (!newErrors.category) {
      setActiveStep(1);
    }
  };

  // ===== Steg 2: Action Next =====
  const handleActionNext = () => {
    const newErrors: Record<string, string> = {};

    if (!actionTitle.trim()) {
      newErrors.action = "Action måste ha ett namn.";
    } else if (actionTitleExists(actionTitle)) {
      newErrors.action = "En action med det namnet finns redan.";
    }

    setErrors((prev) => ({ ...prev, action: newErrors.action || "" }));

    if (!newErrors.action) {
      setActiveStep(2);
    }
  };

  // ===== Steg 3: Commands change =====
  const handleCommandSelectChange = (
    e: SelectChangeEvent<number[]>
  ) => {
    const value = e.target.value as number[];
    setSelectedCommandIds(value);
    setErrors((prev) => ({ ...prev, commands: "" }));
  };

  // ===== Save =====
  const handleSave = async () => {
    const newErrors: Record<string, string> = {};

    const hasExistingCommands = selectedCommandIds.length > 0;
    const hasNewCommand =
      newCommandDescription.trim().length > 0 &&
      newCommandCode.trim().length > 0;

    if (!hasExistingCommands && !hasNewCommand) {
      newErrors.commands =
        "Välj minst ett befintligt command eller skriv in ett nytt.";
    }

    if (hasNewCommand && commandDescriptionExists(newCommandDescription)) {
      newErrors.commands =
        "Ett command med den beskrivningen finns redan.";
    }

    setErrors((prev) => ({
      ...prev,
      commands: newErrors.commands || "",
    }));

    if (Object.keys(newErrors).length > 0) return;

    const usingNewCategory = categoryMode === "new";

    const payload = {
      categoryId: usingNewCategory ? undefined : selectedCategoryId || undefined,
      categoryTitle: usingNewCategory ? newCategoryTitle : undefined,
      actionTitle: actionTitle.trim(),
      commandIds: selectedCommandIds,
      newCommand: hasNewCommand
        ? {
            description: newCommandDescription.trim(),
            code: newCommandCode.trim(),
          }
        : undefined,
    };

    try {
      setSubmitting(true);
      // Koppla mot backend här:
      // await CommandService.CreateAction(payload);
      console.log("Submitting payload:", payload);

      // reset wizard
      setActiveStep(0);
      setCategoryInput("");
      setCategoryMode(null);
      setSelectedCategoryId(null);
      setNewCategoryTitle("");
      setActionTitle("");
      setSelectedCommandIds([]);
      setNewCommandDescription("");
      setNewCommandCode("");
      setErrors({});
    } catch (err) {
      console.error("Failed to create action", err);
    } finally {
      setSubmitting(false);
    }
  };

  const steps = ["Category", "Action", "Commands"];

  return (
    <Container className="app-container" style={{ maxWidth: "100vw" }}>
      {/* Header samma stil som MainPage */}
      <div className="head-box">
        <h1>Add Action</h1>
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
        {/* Stepper */}
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 2 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>
                <span style={{ color: "#fff" }}>{label}</span>
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* ========== STEP 0: CATEGORY ========== */}
        {activeStep === 0 && (
          <>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Choose or create category
            </Typography>

            <Autocomplete
              freeSolo
              options={categories.map((c) => c.title)}
              value={categoryInput}
              onChange={(_, newValue) => {
                setCategoryInput(newValue || "");
                setErrors((prev) => ({ ...prev, category: "" }));
              }}
              onInputChange={(_, newInput) => {
                setCategoryInput(newInput);
                setErrors((prev) => ({ ...prev, category: "" }));
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Type to search or create category"
                  variant="outlined"
                  fullWidth
                />
              )}
            />

            {errors.category && (
              <Typography color="error" variant="body2">
                {errors.category}
              </Typography>
            )}

            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleCategoryNext}
              >
                Next
              </Button>
            </Box>
          </>
        )}

        {/* ========== STEP 1: ACTION ========== */}
        {activeStep === 1 && (
          <>
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              Category:
            </Typography>
            <Typography sx={{ mb: 1, fontWeight: 500 }}>
              {categoryMode === "existing" && selectedCategory
                ? selectedCategory.title
                : `New: ${newCategoryTitle}`}
            </Typography>

            <Typography variant="h6" sx={{ fontWeight: 600, mt: 1 }}>
              Create action
            </Typography>

            <TextField
              label="Action title"
              variant="outlined"
              fullWidth
              value={actionTitle}
              onChange={(e) => {
                setActionTitle(e.target.value);
                setErrors((prev) => ({ ...prev, action: "" }));
              }}
            />

            {selectedCategory && selectedCategory.actions.length > 0 && (
              <Box sx={{ fontSize: ".8rem", opacity: 0.6, mt: 1 }}>
                Existing actions:
                {selectedCategory.actions.slice(0, 4).map((a) => (
                  <Chip
                    key={a.id}
                    label={a.title}
                    size="small"
                    sx={{ ml: ".35rem", mt: ".25rem" }}
                  />
                ))}
                {selectedCategory.actions.length > 4 && " ..."}
              </Box>
            )}

            {errors.action && (
              <Typography color="error" variant="body2">
                {errors.action}
              </Typography>
            )}

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mt: 2,
              }}
            >
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => setActiveStep(0)}
              >
                Back
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleActionNext}
              >
                Next
              </Button>
            </Box>
          </>
        )}

        {/* ========== STEP 2: COMMANDS ========== */}
        {activeStep === 2 && (
          <>
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              Category:
            </Typography>
            <Typography sx={{ fontWeight: 500 }}>
              {categoryMode === "existing" && selectedCategory
                ? selectedCategory.title
                : `New: ${newCategoryTitle}`}
            </Typography>

            <Typography variant="body2" sx={{ opacity: 0.7, mt: 1 }}>
              Action:
            </Typography>
            <Typography sx={{ fontWeight: 500, mb: 2 }}>
              {actionTitle}
            </Typography>

            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Choose existing commands
            </Typography>

            <FormControl fullWidth className="custom-select">
              <InputLabel id="commands-label">
                Choose existing commands
              </InputLabel>
              <Select
                labelId="commands-label"
                multiple
                label="Choose existing commands"
                value={selectedCommandIds}
                onChange={handleCommandSelectChange}
                renderValue={(selected) => {
                  const ids = selected as number[];
                  const labels = ids
                    .map((id) => {
                      const cmd =
                        uniqueCommands.find((c) => c.id === id) ||
                        allCommands.find((c) => c.id === id);
                      if (!cmd) return `#${id}`;
                      return `${cmd.description} (${cmd.code})`;
                    })
                    .join(", ");
                  return labels || "None selected";
                }}
              >
                {uniqueCommands.map((cmd) => (
                  <MenuItem key={cmd.id} value={cmd.id}>
                    <Box sx={{ display: "flex", flexDirection: "column" }}>
                      <Typography variant="body2">
                        {cmd.description}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ opacity: 0.7, fontFamily: "monospace" }}
                      >
                        {cmd.code}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Typography
              align="center"
              sx={{ opacity: 0.7, mt: 2, mb: 1 }}
            >
              or create a new command
            </Typography>

            <TextField
              label="New command description"
              variant="outlined"
              fullWidth
              value={newCommandDescription}
              onChange={(e) => {
                setNewCommandDescription(e.target.value);
                setErrors((prev) => ({ ...prev, commands: "" }));
              }}
              sx={{ mb: 1 }}
            />

            <TextField
              label="New command code"
              variant="outlined"
              fullWidth
              multiline
              minRows={2}
              value={newCommandCode}
              onChange={(e) => {
                setNewCommandCode(e.target.value);
                setErrors((prev) => ({ ...prev, commands: "" }));
              }}
            />

            {errors.commands && (
              <Typography color="error" variant="body2">
                {errors.commands}
              </Typography>
            )}

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mt: 2,
              }}
            >
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => setActiveStep(1)}
              >
                Back
              </Button>
              <Button
                variant="contained"
                color="primary"
                disabled={submitting}
                onClick={handleSave}
              >
                {submitting ? "Saving..." : "Save Action"}
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Container>
  );
}

export default AddActionPage;
