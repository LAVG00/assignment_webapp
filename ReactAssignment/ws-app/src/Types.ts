export interface IDurationsByJobTaskId {
    [jobTaskId: string]: { 
        [hour: number]: number 
    };
  }
  
  export interface ITaskType {
    [Id: string]: { 
        [TaskName: string]: string 
    };
  }