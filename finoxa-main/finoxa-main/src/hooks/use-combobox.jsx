import { useState } from "react";

export const useCombobox = (defaultValue = null) => {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(defaultValue);

    const onOpen = () => setOpen(true);
    const onColse = () => setOpen(false);
    const onSelect = (currentValue) => setValue(currentValue === value ? "" : currentValue);

    return {
        open,
        value,
        onOpen,
        onColse,
        onSelect,
    };
};
