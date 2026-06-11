import { useEffect, useState } from "react";


export const useDebounce = <T,> (value : TaskController, delay = 400 ) => {

    const [debounceValue, setDebounceValue] = useState(value)


    useEffect(()=> {
   const timer = window.setTimeout(() => setDebounceValue(value), delay)
    return () => window.clearTimeout(timer)
    }, [value, delay])

    return debounceValue
}