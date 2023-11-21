import { useEffect } from "react";
import { useHelmet } from "../store/helmet"

export const useHelmetHook = (title)=>{
    const {helmet, setHelmet} = useHelmet();
    
    useEffect(()=>{
        setHelmet(prev=>({...prev, title}))
        return ()=>setHelmet(prev=>({...prev, title: "WatchVid"}))
    }, [])

    return title

}