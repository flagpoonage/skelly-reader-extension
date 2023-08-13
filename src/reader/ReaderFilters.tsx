import { Select } from "../components/Select";
import { themes } from "../common/themes";
import { sandboxStorage } from "./sandbox-storage";
import { ChangeEvent } from "react";
import { Toggle } from "../components/Toggle";

function ReaderFilters() {
  const {
    useDefaultTheme,
    useDisplayDefaultSVG,
    useDisplayDefaultImages,
    useDisplayDefaultVideos,
    DefaultTheme,
    DisplayDefaultSVG,
    DisplayDefaultImages,
    DisplayDefaultVideos
  } = sandboxStorage

  const onThemeChange = (e: ChangeEvent<HTMLSelectElement>) => DefaultTheme.set(e.target.value)

  const onToggleSVG = (v: boolean) => DisplayDefaultSVG.set(v)
  const onToggleImages = (v: boolean) => DisplayDefaultImages.set(v)
  const onToggleVideos = (v: boolean) => DisplayDefaultVideos.set(v)

  return (
    <div className='grid gap-2'>
      <div>
        <div className='pb-1 text-sm font-medium'>
          Theme
        </div>
        <Select
          onChange={onThemeChange}
          options={themes}
          defaultValue={useDefaultTheme()}
        />
      </div>
      <div className='h-0.5 bg-[#f2f2f2]'/>
      <Toggle
        title='Display images'
        enabled={useDisplayDefaultImages()}
        onToggle={onToggleImages}
      />
      <div className='h-0.5 bg-[#f2f2f2]'/>
      <Toggle
        title='Display SVGs'
        enabled={useDisplayDefaultSVG()}
        onToggle={onToggleSVG}
      />
      <div className='h-0.5 bg-[#f2f2f2]'/>
      <Toggle
        title='Display videos'
        enabled={useDisplayDefaultVideos()}
        onToggle={onToggleVideos}
      />
    </div>
  )
}

export { ReaderFilters }
