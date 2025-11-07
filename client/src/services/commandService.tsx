import React from "react";


export interface Command {
    id: number,
    description: string,
    code: string
}

export interface Action {
    id: number,
    description: string,
    Commands: Command[]

}

class CommandService{


static async GetCommandById(id: number): Promise<Command> {
    const response = await fetch(`/api/commands/${id}`, {
      method: "GET",
      cache: "no-store", // <-- stops caching in the browser
      headers: {
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch command with id ${id}: ${response.statusText}`);
    }

    const data: Command = await response.json();
    return data;
  }

  static async GetActionById(id: number): Promise<Action>{
    const response = await fetch(`/api/actions/${id}`, {
        method: "GET",
        cache: "no-store",
        headers: {
            "Accept": "application/json",
        }
    });
    if (!response.ok){
        throw new Error(`Failed :(, ${response.statusText}`)
    }
    const data: Action = await response.json();
    return data;
  }

}
export default CommandService



