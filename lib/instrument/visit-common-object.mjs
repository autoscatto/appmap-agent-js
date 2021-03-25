import { combineResult, encapsulateResult } from './result.mjs';
import { assignVisitorObject, visit } from './visit.mjs';

{
  const makeProperty = (node, location, child1, child2) => ({
    type: 'Property',
    kind: node.kind,
    method: node.method,
    computed: node.computed,
    shorthand: false,
    key: child1,
    value: child2,
  });
  assignVisitorObject('Property', {
    Property: (node, location) =>
      combineResult(
        makeProperty,
        node,
        location,
        visit(
          node.computed ? 'Expression' : 'NonComputedKey',
          node.key,
          location,
        ),
        visit(
          node.kind !== 'init' || node.method ? 'Method' : 'Expression',
          node.value,
          location,
        ),
      ),
  });
}

{
  const makeObjectExpression = (node, location, childeren) => ({
    type: 'ObjectExpression',
    properties: childeren,
  });
  assignVisitorObject('Expression', {
    ObjectExpression: (node, location) =>
      encapsulateResult(
        combineResult(
          makeObjectExpression,
          node,
          location,
          node.properties.map((child) => visit('Property', child, location)),
        ),
        location,
      ),
  });
}
