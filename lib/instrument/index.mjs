import { generate as escodegen } from 'escodegen';
import { RootLocation } from './location.mjs';
import { visit, getResultNode, getResultEntities } from './visit.mjs';

import './visit-class.mjs';
import './visit-closure.mjs';
import './visit-expression.mjs';
import './visit-identifier.mjs';
import './visit-pattern.mjs';
import './visit-program.mjs';
import './visit-statement.mjs';

export default (file, namespace) => {
  const location = new RootLocation();
  /* c8 ignore start */
  if (!location.shouldBeInstrumented(file)) {
    return {
      content: file.content,
      entities: [],
    };
  }
  /* c8 ignore stop */
  const result = visit(file.parse(), { location, file, namespace });
  return {
    content: escodegen(getResultNode(result)),
    entities: getResultEntities(result),
  };
};
