import { useMemo } from "react";
import PropTypes from "prop-types";
import { BEMClass } from "../../../helpers/bem-helper";
import { descriptionTypesMap } from "./component-description-map";
import { Flex } from "components";
import "./related-components.scss";

const CSS_BASE_CLASS = "monday-storybook-related-components";
const bemHelper = BEMClass(CSS_BASE_CLASS);

export const RelatedComponents = ({ componentsNames }) => {
  const componentsDataElements = useMemo(
    () =>
      componentsNames.map((componentName, index) => {
        const key = `${componentName}_${index}`;
        return (
          <section key={key} className={bemHelper({ element: "component-data" })}>
            {descriptionTypesMap.get(componentName)}
          </section>
        );
      }),
    [componentsNames]
  );
  return (
    <article className="monday-storybook-related-components">
      <Flex direction={Flex.directions.ROW} align={Flex.align.START} wrap gap={20}>
        {componentsDataElements}
      </Flex>
    </article>
  );
};

RelatedComponents.propTypes = {
  componentsNames: PropTypes.arrayOf(PropTypes.string)
};

RelatedComponents.defaultProps = {
  componentsNames: []
};
