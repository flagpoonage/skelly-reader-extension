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
    extension_id: window.location.hostname,
  };
}

export const hashChangeSchema = v.object().schema({
  type: v.string().equals('hashchange'),
  new_hash: v.string(),
});

export type HashChange = ValidatorFunctionResultType<typeof hashChangeSchema>;

export const isHashChange = makeTypeAssertion(hashChangeSchema);

export function createHashChange(new_hash: string): HashChange {
  return {
    type: 'hashchange',
    new_hash,
  };
}

export const linkActivateMessageSchema = v.object().schema({
  // ext_id: v.string(),
  // known_id: v.string(),
  type: v.string().equals('link_activate'),
  link_href: v.string(),
});

export type LinkActivateMessage = ValidatorFunctionResultType<
  typeof linkActivateMessageSchema
>;

export const isLinkActivateMessage = makeTypeAssertion(
  linkActivateMessageSchema,
);

export function createLinkActivateMessage(
  msg: Omit<LinkActivateMessage, 'type'>,
): LinkActivateMessage {
  return {
    ...msg,
    type: 'link_activate',
  };
}

export const anchorActivateMessageSchema = v.object().schema({
  type: v.string().equals('anchor_activate'),
  anchor_name: v.string(),
});

export type AnchorActivateMessage = ValidatorFunctionResultType<
  typeof anchorActivateMessageSchema
>;

export const isAnchorActivateMessage = makeTypeAssertion(
  anchorActivateMessageSchema,
);

export function createAnchorActivateMessage(
  anchor_name: string,
): AnchorActivateMessage {
  return {
    type: 'anchor_activate',
    anchor_name,
  };
}

export const frameContentReadySchema = v.object().schema({
  type: v.string().equals('frame_content_ready'),
});

export type FrameContentReady = ValidatorFunctionResultType<
  typeof frameContentReadySchema
>;

export const isFrameContentReady = makeTypeAssertion(frameContentReadySchema);

export function createFrameContentReady(): FrameContentReady {
  return {
    type: 'frame_content_ready',
  };
}
