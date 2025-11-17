// src/services/commandService.ts

export interface Command {
  id: number;
  description: string;
  code: string;
}

export interface Action {
  id: number;
  title: string;
  commands: Command[];
}

export interface Category {
  id: number;
  title: string;
  
}

/**
 * Payload för att skapa en action + ev ny kategori + ev nytt command.
 * Matchar flödet i AddActionPage.
 *
 * - Antingen:
 *    - categoryId (befintlig kategori)
 *   eller
 *    - categoryTitle (ny kategori)
 *
 * - actionTitle (alltid obligatorisk)
 *
 * - commandIds: befintliga commands som kopplas
 * - newCommand: (valfritt) nytt command att skapa samtidigt
 */
export interface CreateActionPayload {
  categoryId?: number;
  categoryTitle?: string;
  actionTitle: string;
  commandIds: number[];
  newCommand?: {
    description: string;
    code: string;
  };
}

class CommandService {
  // ===== Commands =====

  static async GetCommands(): Promise<Command[]> {
    const response = await fetch(`/api/commands`, {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch commands: ${response.status} ${response.statusText}`);
    }

    const data: Command[] = await response.json();
    return data;
  }

  static async GetCommandById(id: number): Promise<Command> {
    const response = await fetch(`/api/commands/${id}`, {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch command with id ${id}: ${response.status} ${response.statusText}`
      );
    }

    const data: Command = await response.json();
    return data;
  }

  // ===== Actions =====

  static async GetActions(): Promise<Action[]> {
    const response = await fetch(`/api/actions`, {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch actions: ${response.status} ${response.statusText}`);
    }

    const data: Action[] = await response.json();
    return data;
  }

  static async GetActionById(id: number): Promise<Action> {
    const response = await fetch(`/api/actions/${id}`, {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch action with id ${id}: ${response.status} ${response.statusText}`
      );
    }

    const data: Action = await response.json();
    return data;
  }

  static async CreateAction(payload: CreateActionPayload): Promise<Action> {
    const response = await fetch(`/api/actions`, {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(
        `Failed to create action: ${response.status} ${response.statusText} ${text || ""}`
      );
    }

    const data: Action = await response.json();
    return data;
  }

  // ===== Categories =====

  static async GetCategories(): Promise<Category[]> {
    const response = await fetch(`/api/categories`, {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch categories: ${response.status} ${response.statusText}`
      );
    }

    const data: Category[] = await response.json();
    return data;
  }
}

export default CommandService;
