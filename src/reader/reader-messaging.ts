import {
  makeTypeAssertion,
  DW as v,
  ValidatorFunctionResultType,
} from 'dealwith';

export const sandboxFrameReadySchema = v.object().schema({
  type: v.string().equals('ready'),
});

export type SandboxFrameReady = ValidatorFunctionResultType<
  typeof sandboxFrameReadySchema
>;

export const isSandboxFrameReady = makeTypeAssertion(sandboxFrameReadySchema);

export function createSandboxFrameReady(): SandboxFrameReady {
  return {
    type: 'ready',
  };
}

export const sandboxInitializeSchema = v.object().schema({
  type: v.string().equals('initialize'),
  target_url: v.string(),
  html_string: v.string(),
  authkey: v.string(),
  extension_id: v.string(),
});

export type SandboxInitialize = ValidatorFunctionResultType<
  typeof sandboxInitializeSchema
>;

export const isSandboxInitialize = makeTypeAssertion(sandboxInitializeSchema);

export function createSandboxInitialize(
  target_url: string,
  html_string: string,
  authkey: string,
): SandboxInitialize {
  return {
    type: 'initialize',
    html_string,
    target_url,
    authkey,
    extension_id: chrome.runtime.id,
  };
}
