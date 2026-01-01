export type memoryNode = { 
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   [others: string]: any;
    id?: string | number | undefined;
    x?: number | undefined;
    y?: number | undefined;
    vx?: number | undefined;
    vy?: number | undefined;
    fx?: number | undefined;
    fy?: number | undefined;
}