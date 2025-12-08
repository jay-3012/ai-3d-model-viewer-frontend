/**
 * Home generation types
 */

export interface Room {
    id: string;
    type: 'living_room' | 'bedroom' | 'kitchen' | 'bathroom' | 'balcony' | 'dining_room' | 'office';
    dimensions: {
        width_ft: number;
        height_ft: number;
    };
    position: {
        x_ft: number;
        y_ft: number;
    };
}

export interface Connection {
    from: string;
    to: string;
    type: 'door';
    position: {
        x_ft: number;
        y_ft: number;
    };
}

export interface FurniturePlacement {
    furnitureType: 'chair' | 'sofa' | 'desk' | 'cupboard';
    position: {
        x: number;
        y: number;
        z: number;
    };
    rotation: {
        x: number;
        y: number;
        z: number;
    };
    scale: {
        x: number;
        y: number;
        z: number;
    };
}

export interface FloorPlan {
    rooms: Room[];
    connections: Connection[];
    totalDimensions: {
        width_ft: number;
        height_ft: number;
    };
}

export interface HomeGenerationResponse {
    success: boolean;
    id: string;
    plan2D: string;
    model3D: string;
    furnished3D: string;
    data: {
        rooms: Room[];
        connections: Connection[];
        furniture: FurniturePlacement[];
        totalDimensions: {
            width_ft: number;
            height_ft: number;
        };
    };
    error?: string;
}
