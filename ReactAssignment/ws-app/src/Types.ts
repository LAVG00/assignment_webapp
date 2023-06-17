export interface IDurationsByJobTaskId {
    [jobTaskId: string]: { 
        [hour: number]: number 
    };
  }
  
