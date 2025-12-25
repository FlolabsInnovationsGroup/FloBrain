export type nodeType = {
    id: string;
    position: {
        x: number;
        y: number;
    };
    data: {
        label: string;
    };
    type: string;
}

export type edgeType = {
    id: string;
    source: string;
    target: string;
}

export type memoryParticleType = {
    id: string;
    description: string;
    weight: number;
    relations: string[];
}