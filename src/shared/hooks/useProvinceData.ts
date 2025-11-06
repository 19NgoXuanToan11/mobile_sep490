import { useMemo, useRef } from "react";
import provincesData from "../data/provinces.json";

export interface Ward {
  code: string;
  name: string;
}

export interface District {
  code: string;
  name: string;
  wards: Ward[];
}

export interface Province {
  code: string;
  name: string;
  districts: District[];
}

/**
 * Hook to manage cascading province/district/ward data
 * Data is loaded once and memoized for performance
 */
export function useProvinceData() {
  // Load data once using useRef (never changes)
  const provinces = useRef<Province[]>(provincesData as Province[]).current;

  /**
   * Get all provinces
   */
  const getProvinces = useMemo(() => provinces, [provinces]);

  /**
   * Get districts by province code
   */
  const getDistrictsByProvince = (provinceCode: string): District[] => {
    const province = provinces.find((p) => p.code === provinceCode);
    return province?.districts || [];
  };

  /**
   * Get wards by district code
   */
  const getWardsByDistrict = (
    provinceCode: string,
    districtCode: string
  ): Ward[] => {
    const province = provinces.find((p) => p.code === provinceCode);
    const district = province?.districts.find((d) => d.code === districtCode);
    return district?.wards || [];
  };

  /**
   * Find province by code
   */
  const findProvince = (code: string): Province | undefined => {
    return provinces.find((p) => p.code === code);
  };

  /**
   * Find district by code
   */
  const findDistrict = (
    provinceCode: string,
    districtCode: string
  ): District | undefined => {
    const province = provinces.find((p) => p.code === provinceCode);
    return province?.districts.find((d) => d.code === districtCode);
  };

  /**
   * Find ward by code
   */
  const findWard = (
    provinceCode: string,
    districtCode: string,
    wardCode: string
  ): Ward | undefined => {
    const province = provinces.find((p) => p.code === provinceCode);
    const district = province?.districts.find((d) => d.code === districtCode);
    return district?.wards.find((w) => w.code === wardCode);
  };

  /**
   * Find province/district/ward by names (for backward compatibility with old data)
   */
  const findByNames = (
    provinceName?: string,
    districtName?: string,
    wardName?: string
  ): {
    province?: Province;
    district?: District;
    ward?: Ward;
  } => {
    let foundProvince: Province | undefined;
    let foundDistrict: District | undefined;
    let foundWard: Ward | undefined;

    if (provinceName) {
      foundProvince = provinces.find(
        (p) => p.name.toLowerCase() === provinceName.toLowerCase()
      );
    }

    if (foundProvince && districtName) {
      foundDistrict = foundProvince.districts.find(
        (d) => d.name.toLowerCase() === districtName.toLowerCase()
      );
    }

    if (foundDistrict && wardName) {
      foundWard = foundDistrict.wards.find(
        (w) => w.name.toLowerCase() === wardName.toLowerCase()
      );
    }

    return {
      province: foundProvince,
      district: foundDistrict,
      ward: foundWard,
    };
  };

  /**
   * Get full address text from codes
   */
  const getFullAddressText = (
    provinceCode: string,
    districtCode: string,
    wardCode: string,
    street: string
  ): string => {
    const province = findProvince(provinceCode);
    const district = findDistrict(provinceCode, districtCode);
    const ward = findWard(provinceCode, districtCode, wardCode);

    const parts = [street, ward?.name, district?.name, province?.name].filter(
      Boolean
    );

    return parts.join(", ");
  };

  return {
    provinces: getProvinces,
    getDistrictsByProvince,
    getWardsByDistrict,
    findProvince,
    findDistrict,
    findWard,
    findByNames,
    getFullAddressText,
  };
}
