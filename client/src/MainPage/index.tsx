import { useState } from "react";
import "./MainPage.css";
import logo from "./../assets/logo.png";
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Container,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";

type Command = { description: string; code: string };
type Action = { title: string; commands: Command[] };
type Category = { name: string; actions: Action[] };

const categories: Category[] = [
  {
    name: "GitHub",
    actions: [
      {
        title: "Skapa Git repo",
        commands: [
          { description: "Initiera repo i aktuell mapp", code: "git init" },
          {
            description: "Skapa .gitignore via dotnet",
            code: "dotnet new gitignore",
          },
          { description: "Lägg till alla filer", code: "git add ." },
          {
            description: "Första commit",
            code: `git commit -m "Initial commit"`,
          },
          {
            description: "Koppla remote (byt USER/REPO)",
            code: "git remote add origin git@github.com:USER/REPO.git",
          },
          {
            description: "Push till main",
            code: "git branch -M main && git push -u origin main",
          },
        ],
      },
      {
        title: "Rebase branch",
        commands: [
          { description: "Hämta senaste", code: "git fetch origin" },
          { description: "Rebase mot main", code: "git rebase origin/main" },
        ],
      },
      {
        title: "Push med force (försiktigt)",
        commands: [
          {
            description: "Force-pusha ändrad historik",
            code: "git push --force",
          },
        ],
      },
    ],
  },
  {
    name: "React",
    actions: [
      {
        title: "Skapa nytt projekt (Vite + TS)",
        commands: [
          {
            description: "Skapa app",
            code: "npm create vite@latest my-app -- --template react-ts",
          },
        ],
      },
      {
        title: "Starta utvecklingsserver",
        commands: [{ description: "Starta Vite dev", code: "npm run dev" }],
      },
    ],
  },
  {
    name: "Docker",
    actions: [
      {
        title: "Bygg image",
        commands: [
          {
            description: "Bygg från Dockerfile",
            code: "docker build -t my-app .",
          },
        ],
      },
      {
        title: "Starta container",
        commands: [
          {
            description: "Kör container",
            code: "docker run -p 8080:80 my-app",
          },
        ],
      },
    ],
  },
];

function MainPage() {
  const [categoryValue, setCategoryValue] = useState<string>("");
  const [commandValue, setCommandValue] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);

  const handleCategoryChange = (e: SelectChangeEvent<string>) => {
    const name = e.target.value;
    setCategoryValue(name);
    const cat = categories.find((c) => c.name === name) ?? null;
    setSelectedCategory(cat);
    setSelectedAction(null);
    setCommandValue("");
  };

  const handleCommandChange = (e: SelectChangeEvent<string>) => {
    const title = e.target.value;
    setCommandValue(title);
    const cmd =
      selectedCategory?.actions.find((c) => c.title === title) ?? null;
    setSelectedAction(cmd);
  };

  return (
    <Container className="app-container" style={{ maxWidth: "100vw" }}>
      <div className="head-box">
        <img className="logo" src={logo} />
        <h1>Command Sync</h1>
      </div>

      {/* Välj kategori */}
      <div style={{ maxWidth: 420, width: "100%", margin: "0 auto 2rem" }}>
        <FormControl fullWidth className="custom-select">
          <InputLabel id="category-label">Choose Category</InputLabel>
          <Select
            labelId="category-label"
            label="Choose Category"
            value={categoryValue}
            onChange={handleCategoryChange}
          >
            {categories.map((cat) => (
              <MenuItem key={cat.name} value={cat.name}>
                {cat.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      {selectedCategory && (
        <div style={{ maxWidth: 420, width: "100%", margin: "0 auto 2rem" }}>
          <FormControl fullWidth className="custom-select">
            <InputLabel id="command-label">Choose Command</InputLabel>
            <Select
              labelId="command-label"
              label="Choose Command"
              value={commandValue}
              onChange={handleCommandChange}
            >
              {selectedCategory.actions.map((cmd) => (
                <MenuItem key={cmd.title} value={cmd.title}>
                  {cmd.title}
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
          <h3 style={{ marginBottom: ".75rem" }}>{selectedAction.title}</h3>

          {selectedAction.commands.map((step, i) => (
            <div key={i} style={{ marginBottom: "1rem" }}>
              <div style={{ opacity: 0.9, marginBottom: ".25rem" }}>
                <strong>Steg {i + 1}:</strong> {step.description}
              </div>
              <pre className="code-block">{step.code}</pre>
            </div>
          ))}
        </div>
      )}
    </Container>
  );
}

export default MainPage;
