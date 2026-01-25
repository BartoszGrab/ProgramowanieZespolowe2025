import {
  appendOwnerState_default,
  mergeSlotProps_default,
  resolveComponentProps_default
} from "./chunk-W5OHQNJQ.js";
import {
  useForkRef
} from "./chunk-OD4GYLUR.js";

// node_modules/@mui/utils/esm/useSlotProps/useSlotProps.js
function useSlotProps(parameters) {
  const {
    elementType,
    externalSlotProps,
    ownerState,
    skipResolvingSlotProps = false,
    ...other
  } = parameters;
  const resolvedComponentsProps = skipResolvingSlotProps ? {} : resolveComponentProps_default(externalSlotProps, ownerState);
  const {
    props: mergedProps,
    internalRef
  } = mergeSlotProps_default({
    ...other,
    externalSlotProps: resolvedComponentsProps
  });
  const ref = useForkRef(internalRef, resolvedComponentsProps?.ref, parameters.additionalProps?.ref);
  const props = appendOwnerState_default(elementType, {
    ...mergedProps,
    ref
  }, ownerState);
  return props;
}
var useSlotProps_default = useSlotProps;

export {
  useSlotProps_default
};
//# sourceMappingURL=chunk-56TNWEJB.js.map
