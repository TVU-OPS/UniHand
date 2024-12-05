import { District } from "./district";
import { Province } from "./province"
import { Ward } from "./ward";

export type Location = {
    Province: Province;
    District: District;
    Ward: Ward;
    Road: string;
    Amenity: string;
}

export type LocationData = {
    data: Location;
}