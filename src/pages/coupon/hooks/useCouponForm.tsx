import { useState } from "react";

export type DiscountType = "amount" | "percent";

type Init = Partial<{
  name: string;
  detail: string;
  amount?: number;
  rate?: number;
  qty: number;
  discountType: DiscountType;
}>;

export const useCouponForm = (init: Init = {}) => {
  const [name, setName] = useState(init.name ?? "");
  const [detail, setDetail] = useState(init.detail ?? "");
  const [amount, setAmount] = useState<number | "">(init.amount ?? "");

  const [rate, setRate] = useState<number | "">(init.rate ?? "");

  const [qty, setQty] = useState<number | "">(init.qty ?? "");
  const [discountType, setDiscountType] = useState<DiscountType>(
    init.discountType ?? "amount"
  );

  const reset = () => {
    setName("");
    setDetail("");
    setAmount("");
    setRate("");
    setQty("");
    setDiscountType("amount");
  };

  const toNumOrEmpty = (v: string) => {
    if (v === "") return "";
    const n = Number(v);
    return Number.isNaN(n) ? "" : n;
  };

  const bind = {
    name: { value: name, onChange: setName },
    detail: { value: detail, onChange: setDetail },
    amount: {
      value: amount,
      onChange: (v: string) => setAmount(toNumOrEmpty(v)),
      name: "amount",
    },
    rate: {
      value: rate,
      onChange: (v: string) => setRate(toNumOrEmpty(v)),
      name: "rate",
    },
    qty: {
      value: qty,
      onChange: (v: string) => setQty(toNumOrEmpty(v)),
      name: "qty",
    },
  };
  const radio = {
    discountType,
    set: setDiscountType,
    isAmount: discountType === "amount",
    isRate: discountType === "percent",
  };

  const isReady =
    name.trim() !== "" &&
    (bind.rate?.value !== "" || bind.amount?.value !== "") &&
    (radio.discountType === "percent"
      ? Number(bind.rate.value) <= 100
      : true) &&
    qty !== "";

  return {
    name,
    detail,
    rate,
    amount,
    qty,
    discountType,

    setName,
    setDetail,
    setRate,
    setAmount,
    setQty,
    setDiscountType,

    bind,
    radio,
    isReady,
    reset,
  };
};
