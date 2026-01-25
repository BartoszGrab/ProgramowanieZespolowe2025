import {
  SvgIcon_default
} from "./chunk-5ZBVLF5Y.js";
import {
  require_jsx_runtime
} from "./chunk-DVDZ2TOI.js";
import {
  require_react
} from "./chunk-ULSRCYB6.js";
import {
  __toESM
} from "./chunk-G3PMV62Z.js";

// node_modules/@mui/material/esm/utils/createSvgIcon.js
var React = __toESM(require_react(), 1);
var import_jsx_runtime = __toESM(require_jsx_runtime(), 1);
function createSvgIcon(path, displayName) {
  function Component(props, ref) {
    return (0, import_jsx_runtime.jsx)(SvgIcon_default, {
      "data-testid": true ? `${displayName}Icon` : void 0,
      ref,
      ...props,
      children: path
    });
  }
  if (true) {
    Component.displayName = `${displayName}Icon`;
  }
  Component.muiName = SvgIcon_default.muiName;
  return React.memo(React.forwardRef(Component));
}

export {
  createSvgIcon
};
//# sourceMappingURL=chunk-AKE3NEW4.js.map
