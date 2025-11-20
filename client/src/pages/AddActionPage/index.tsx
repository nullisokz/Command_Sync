import { useEffect, useState, useMemo } from "react";
import "./AddActionPage.css";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Chip,
  Autocomplete,
  Stepper,
  Step,
  StepLabel,
  IconButton,
} from "@mui/material";
import { ArrowUpward, ArrowDownward, Delete } from "@mui/icons-material";
import CommandService from "../../services/commandService";
import type { CreateActionPayload } from "../../services/commandService";

type Command = { id: number; description: string; code: string };
type Category = { id: number; title: string };
type Action = { id: number; title: string; commands: Command[]; category: Category };

type StepIndex = 0 | 1 | 2;

type ExistingStep = { kind: "existing"; commandId: number };
type NewStep = { kind: "new"; description: string; code: string };
type StepItem = ExistingStep | NewStep;

function AddActionPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [allCommands, setAllCommands] = useState<Command[]>([]);
  const [categoryActions, setCategoryActions] = useState<Action[]>([]);
  const [activeStep, setActiveStep] = useState<StepIndex>(0);
  const [categoryInput, setCategoryInput] = useState("");
  const [categoryMode, setCategoryMode] = useState<"existing" | "new" | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [newCategoryTitle, setNewCategoryTitle] = useState("");
  const [actionTitle, setActionTitle] = useState("");
  const [steps, setSteps] = useState<StepItem[]>([]);
  const [codeInput, setCodeInput] = useState("");
  const [newCommandDescription, setNewCommandDescription] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const trimLower = (v: string) => v.trim().toLowerCase();
  const categoryTitleExists = (title: string) =>
    categories.some((c) => trimLower(c.title) === trimLower(title));

  const actionTitleExists = (title: string) =>
    categoryActions.some((a) => trimLower(a.title) === trimLower(title));

  const commandDescriptionExists = (description: string) =>
    allCommands.some(
      (cmd) => trimLower(cmd.description) === trimLower(description)
    );

  const selectedCategory =
    selectedCategoryId != null
      ? categories.find((c) => c.id === selectedCategoryId) ?? null
      : null;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cats = await CommandService.GetCategories();
        setCategories(cats);
      } catch (err) {
        console.error("Failed to load data", err);
      }
    };
    fetchData();
  }, []);

  const uniqueCommands = useMemo(() => {
    const map = new Map<string, Command>();
    for (const cmd of allCommands) {
      const key =
        cmd.description.trim().toLowerCase() + "|" + cmd.code.trim();
      if (!map.has(key)) {
        map.set(key, cmd);
      }
    }
    return Array.from(map.values());
  }, [allCommands]);

  const existingForCurrentCode = useMemo(() => {
    const trimmed = codeInput.trim().toLowerCase();
    if (!trimmed) return null;
    return (
      allCommands.find(
        (c) => c.code.trim().toLowerCase() === trimmed
      ) ?? null
    );
  }, [codeInput, allCommands]);

  const handleCategoryNext = async () => {
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
        try {
          const acts = await CommandService.GetActionsByCategory(existing.id);
          setCategoryActions(acts);
        } catch (err) {
          console.error("Failed to load actions for category", err);
          setCategoryActions([]);
        }
      } else {
        if (categoryTitleExists(value)) {
          newErrors.category = "Den kategorin finns redan.";
        } else {
          setCategoryMode("new");
          setNewCategoryTitle(value);
          setSelectedCategoryId(null);
          setCategoryActions([]);
        }
      }
    }

    setErrors((prev) => ({ ...prev, category: newErrors.category || "" }));

    if (!newErrors.category) {
      setActiveStep(1);
    }
  };

  const handleActionNext = async () => {
    const newErrors: Record<string, string> = {};

    if (!actionTitle.trim()) {
      newErrors.action = "Action måste ha ett namn.";
    } else if (actionTitleExists(actionTitle)) {
      newErrors.action = "En action med det namnet finns redan i denna kategorin.";
    }

    setErrors((prev) => ({ ...prev, action: newErrors.action || "" }));

    if (newErrors.action) {
      return;
    }

    try {
      if (categoryMode === "existing" && selectedCategoryId != null) {
        const cmds = await CommandService.GetCommandsByCategoryId(
          selectedCategoryId
        );
        setAllCommands(cmds);
      } else {
        setAllCommands([]);
      }
    } catch (err) {
      console.error("Failed to load commands for category", err);
      setAllCommands([]);
    }

    setSteps([]);
    setCodeInput("");
    setNewCommandDescription("");
    setErrors((prev) => ({ ...prev, commands: "" }));

    setActiveStep(2);
  };

  const handleAutocompleteChange = (
    _: any,
    newValue: Command | string | null
  ) => {
    if (!newValue || typeof newValue === "string") {
      return;
    }

    setSteps((prev) => {
      if (prev.some((s) => s.kind === "existing" && s.commandId === newValue.id)) {
        return prev;
      }
      return [...prev, { kind: "existing", commandId: newValue.id }];
    });
    setCodeInput("");
    setErrors((prev) => ({ ...prev, commands: "" }));
  };

  const handleAddNewCommandStep = () => {
    const code = codeInput.trim();
    const desc = newCommandDescription.trim();
    if (!code || !desc) return;

    setSteps((prev) => [...prev, { kind: "new", code, description: desc }]);
    setCodeInput("");
    setNewCommandDescription("");
    setErrors((prev) => ({ ...prev, commands: "" }));
  };

  const handleMoveStep = (index: number, direction: "up" | "down") => {
    setSteps((prev) => {
      const newArr = [...prev];
      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= newArr.length) return prev;
      const tmp = newArr[index];
      newArr[index] = newArr[newIndex];
      newArr[newIndex] = tmp;
      return newArr;
    });
  };

  const handleRemoveStepAt = (index: number) => {
    setSteps((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    // --- Validering & Stegfiltrering (Låt det vara) ---
    const newErrors: Record<string, string> = {};

    const newSteps = steps.filter(
      (s): s is NewStep => s.kind === "new"
    );
    const existingSteps = steps.filter(
      (s): s is ExistingStep => s.kind === "existing"
    );

    const hasAnySteps = steps.length > 0;

    if (!hasAnySteps) {
      newErrors.commands = "Lägg till minst ett command i listan.";
    }

    // Antaget att du har denna funktion
    // if (newSteps.some((s) => commandDescriptionExists(s.description))) {
    //   newErrors.commands = "Minst ett av de nya commandsen har en beskrivning som redan finns.";
    // }

    setErrors((prev) => ({
      ...prev,
      commands: newErrors.commands || "",
    }));

    if (Object.keys(newErrors).length > 0) return;

    // --- Skapa Payload ---
    const usingNewCategory = categoryMode === "new";

    // 1. Samla ID:n för befintliga commands
    const commandIds = existingSteps.map((s) => s.commandId);

    // 2. Skapa DTO:er för nya commands
    const newCommandsPayload = newSteps.length
        ? newSteps.map((s) => ({
            description: s.description.trim(),
            code: s.code.trim(),
          }))
        : undefined;

    // Bygger payloaden som matchar C# AddActionRequestDTO
    const payload: CreateActionPayload = {
      categoryId: usingNewCategory ? undefined : selectedCategoryId || undefined,
      categoryTitle: usingNewCategory ? newCategoryTitle.trim() : undefined,
      actionTitle: actionTitle.trim(),
      commandIds: commandIds.length > 0 ? commandIds : undefined, // Skicka undefined om tom array
      newCommands: newCommandsPayload,
    } as CreateActionPayload;

    try {
      setSubmitting(true);
      
      // Anropar CommandService som returnerar Promise<string> (framgångsmeddelandet)
      const successMessage = await CommandService.CreateAction(payload); 
      console.log("Action skapades:", successMessage); // Logga framgångsmeddelandet

      // --- Återställning av state efter framgångsrik skapelse ---
      setActiveStep(0);
      // ... (fortsätt med all din rensningslogik)
      setCategoryInput("");
      setCategoryMode(null);
      setSelectedCategoryId(null);
      setNewCategoryTitle("");
      setActionTitle("");
      setSteps([]);
      setCodeInput("");
      setNewCommandDescription("");
      setErrors({});
      setCategoryActions([]);
      setAllCommands([]);

    } catch (err) {
      console.error("Failed to create action", err);
      // Här kan du lägga till logik för att visa felet för användaren, t.ex.
      // setErrors(prev => ({ ...prev, general: "Kunde inte spara action. Se konsolen för detaljer." }));
    } finally {
      setSubmitting(false);
    }
  };

  const stepsLabels = ["Category", "Action", "Commands"];

  return (
    <Container className="app-container" style={{ maxWidth: "100vw" }}>
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
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 2 }}>
          {stepsLabels.map((label) => (
            <Step key={label}>
              <StepLabel>
                <span style={{ color: "#fff" }}>{label}</span>
              </StepLabel>
            </Step>
          ))}
        </Stepper>

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

            {categoryActions.length > 0 && (
              <Box sx={{ fontSize: ".8rem", opacity: 0.6, mt: 1 }}>
                Existing actions:
                {categoryActions.slice(0, 4).map((a) => (
                  <Chip
                    key={a.id}
                    label={a.title}
                    size="small"
                    sx={{ ml: ".35rem", mt: ".25rem" }}
                  />
                ))}
                {categoryActions.length > 4 && " ..."}
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
              Add command (search by code)
            </Typography>

            <Autocomplete
              freeSolo
              options={uniqueCommands}
              getOptionLabel={(option) =>
                typeof option === "string" ? option : option.code
              }
              inputValue={codeInput}
              onInputChange={(_, newInput) => {
                setCodeInput(newInput);
                setErrors((prev) => ({ ...prev, commands: "" }));
              }}
              onChange={handleAutocompleteChange}
              renderOption={(props, option) => {
                const cmd = option as Command;
                return (
                  <li {...props} key={cmd.id}>
                    <Box sx={{ display: "flex", flexDirection: "column" }}>
                      <Typography variant="body2">
                        {cmd.code}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ opacity: 0.7 }}
                      >
                        {cmd.description}
                      </Typography>
                    </Box>
                  </li>
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Type command code, e.g. git init"
                  variant="outlined"
                />
              )}
            />

            {codeInput.trim() && existingForCurrentCode && (
              <Typography variant="caption" sx={{ mt: 0.5, opacity: 0.7 }}>
                This code already exists. Select it in the dropdown above to add
                it as a step.
              </Typography>
            )}

            {codeInput.trim() && !existingForCurrentCode && (
              <Box sx={{ mt: 2 }}>
                <Typography
                  align="left"
                  sx={{ opacity: 0.8, mb: 1 }}
                >
                  This looks like a new command. Add a description and click
                  &quot;Add new command&quot;.
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

                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    variant="outlined"
                    onClick={handleAddNewCommandStep}
                    disabled={
                      !codeInput.trim() ||
                      !newCommandDescription.trim()
                    }
                  >
                    Add new command
                  </Button>
                </Box>
              </Box>
            )}

            {steps.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 600, mb: 1 }}
                >
                  Steps in this action
                </Typography>

                {steps.map((step, index) => {
                  let description = "";
                  let code = "";

                  if (step.kind === "existing") {
                    const cmd = allCommands.find(
                      (c) => c.id === step.commandId
                    );
                    if (!cmd) return null;
                    description = cmd.description;
                    code = cmd.code;
                  } else {
                    description = step.description;
                    code = step.code;
                  }

                  return (
                    <Box
                      key={`${step.kind}-${index}`}
                      sx={{
                        display: "flex",
                        gap: 1,
                        alignItems: "flex-start",
                        borderRadius: "12px",
                        padding: "0.75rem 1rem",
                        border: "1px solid rgba(255,255,255,0.08)",
                        backgroundColor: "rgba(255,255,255,0.02)",
                        mb: 1,
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <div
                          style={{
                            opacity: 0.9,
                            marginBottom: ".35rem",
                            fontWeight: 500,
                          }}
                        >
                          <strong>Step {index + 1}:</strong> {description}
                        </div>
                        <pre className="code-block">{code}</pre>
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 0.5,
                          alignItems: "center",
                          mt: 0.5,
                        }}
                      >
                        <IconButton
                          size="small"
                          onClick={() => handleMoveStep(index, "up")}
                          disabled={index === 0}
                        >
                          <ArrowUpward fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleMoveStep(index, "down")}
                          disabled={index === steps.length - 1}
                        >
                          <ArrowDownward fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveStepAt(index)}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            )}

            {errors.commands && (
              <Typography color="error" variant="body2" sx={{ mt: 1 }}>
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
