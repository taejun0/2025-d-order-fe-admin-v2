import { useState } from "react";

export type DiscountType = "price" | "rate";

type Init = Partial<{
  name: string;
  detail: string;
  price: number;
  qty: number;
  discountType: DiscountType;
}>;

export const useCouponForm = (init: Init = {}) => {
  const [name, setName] = useState(init.name ?? "");
  const [detail, setDetail] = useState(init.detail ?? "");
  const [price, setPrice] = useState<number | "">(init.price ?? "");

  const [qty, setQty] = useState<number | "">(init.qty ?? "");
  const [discountType, setDiscountType] = useState<DiscountType>(
    init.discountType ?? "price"
  );

  const reset = () => {
    setName("");
    setDetail("");
    setPrice("");
    setQty("");
    setDiscountType("price");
  };

  const toNumOrEmpty = (v: string) => {
    if (v === "") return "";
    const n = Number(v);
    return Number.isNaN(n) ? "" : n;
  };

  const bind = {
    name: { value: name, onChange: setName },
    detail: { value: detail, onChange: setDetail },
    price: {
      value: price,
      onChange: (v: string) => setPrice(toNumOrEmpty(v)),
      name: "price",
    },
    qty: {
      value: qty,
      onChange: (v: string) => setQty(toNumOrEmpty(v)),
      name: "qty",
    },
  };

  const isReady =
    name.trim() !== "" &&
    bind.price.value !== "" &&
    Number(bind.price.value) <= 100 &&
    qty !== "";

  const radio = {
    discountType,
    set: setDiscountType,
    isPrice: discountType === "price",
    isRate: discountType === "rate",
  };

  const toPayload = () => ({
    name: name.trim(),
    detail: detail.trim() || undefined,
    price: typeof price === "number" ? price : 0,
    qty: typeof qty === "number" ? qty : 0,
    discountType,
  });

  return {
    name,
    detail,
    price,
    qty,
    discountType,

    setName,
    setDetail,
    setPrice,
    setQty,
    setDiscountType,

    bind,
    radio,
    isReady,
    reset,
    toPayload,
  };
};
