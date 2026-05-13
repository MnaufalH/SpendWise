import { useState } from "react"

export function useInput(defaultValue = '') {
    const [value, setValue] = useState(defaultValue)

    const onChangeValue = (e) => {
        setValue(e.target.value)
    }

    return [value, onChangeValue]
}
