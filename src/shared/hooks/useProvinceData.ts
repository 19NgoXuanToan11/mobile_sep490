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

export function useProvinceData() {

  const provinces = useRef<Province[]>(provincesData as Province[]).current;

  const getProvinces = useMemo(() => provinces, [provinces]);

  const getDistrictsByProvince = (provinceCode: string): District[] => {
    const province = provinces.find((p) => p.code === provinceCode);
    return province?.districts || [];
  };

  const getWardsByDistrict = (
    provinceCode: string,
    districtCode: string
  ): Ward[] => {
    const province = provinces.find((p) => p.code === provinceCode);
    const district = province?.districts.find((d) => d.code === districtCode);
    return district?.wards || [];
  };

  const findProvince = (code: string): Province | undefined => {
    return provinces.find((p) => p.code === code);
  };

  const findDistrict = (
    provinceCode: string,
    districtCode: string
  ): District | undefined => {
    const province = provinces.find((p) => p.code === provinceCode);
    return province?.districts.find((d) => d.code === districtCode);
  };

  const findWard = (
    provinceCode: string,
    districtCode: string,
    wardCode: string
  ): Ward | undefined => {
    const province = provinces.find((p) => p.code === provinceCode);
    const district = province?.districts.find((d) => d.code === districtCode);
    return district?.wards.find((w) => w.code === wardCode);
  };

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
