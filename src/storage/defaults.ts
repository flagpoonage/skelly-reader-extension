import { extension } from "../extension";
import { isObject } from "../common/is";

export const displayDefaultImages = {
  set: (v: boolean) => extension.storage.local.set({displayDefaultImages: v}),
  get: async (): Promise<boolean> => {
    const defaultValue = await extension.storage.local.get(['displayDefaultImages'])
    return isObject(defaultValue) ? defaultValue.displayDefaultImages as boolean : false
  }
}

export const displayDefaultSVG = {
  set: (v: boolean) => extension.storage.local.set({displayDefaultSVG: v}),
  get: async (): Promise<boolean> => {
    const defaultValue = await extension.storage.local.get(['displayDefaultSVG'])
    return isObject(defaultValue) ? defaultValue.displayDefaultSVG as boolean : true
  }
}

export const displayDefaultVideos = {
  set: (v: boolean) => extension.storage.local.set({displayDefaultVideos: v}),
  get: async (): Promise<boolean> => {
    const defaultValue = await extension.storage.local.get(['displayDefaultVideos'])
    return isObject(defaultValue) ? defaultValue.displayDefaultVideos as boolean : false
  }
}

export const defaultTheme = {
  set: (v: string) => extension.storage.local.set({defaultTheme: v}),
  get: async (): Promise<string> => {
    const defaultValue = await extension.storage.local.get(['defaultTheme'])
    return isObject(defaultValue) ? defaultValue.defautTheme as string : 'none'
  }
}
