import React, { cloneElement, useEffect, useMemo } from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import cx from "classnames";
import styles from "./Modal.module.scss";
import { useA11yDialog } from "./a11YDialog";
import { ModalContent, ModalFooter, ModalHeader } from "components";
import { clearAllBodyScrollLocks, disableBodyScroll, enableBodyScroll } from "body-scroll-lock";
import useAnimationProps from "components/Modal/useAnimationProps";

export const MODAL_SIZE = {
  DEFAULT: "default",
  FULL_WIDTH: "full_width"
};

const Modal = ({
  classNames,
  id,
  show,
  title,
  description,
  onClose,
  isAlertDialog,
  children,
  triggerElement,
  size,
  hideCloseButton,
  closeButtonAriaLabel
}) => {
  const [instance, attr] = useA11yDialog({
    id,
    onClose,
    isAlertDialog
  });

  const getAnimationProps = useAnimationProps(triggerElement, instance);

  // clear all scroll locks on unmount (just to be safe)
  useEffect(() => {
    return () => clearAllBodyScrollLocks();
  }, []);

  // lock body on modal show
  useEffect(() => {
    instance?.on("show", () => disableBodyScroll(instance.$el, { reserveScrollBarGap: true }));
    instance?.on("hide", () => enableBodyScroll(instance.$el));
    return () => {
      instance?.off("show");
      instance?.off("hide");
    };
  }, [instance]);

  // show/hide and animate the modal
  useEffect(() => {
    if (instance) {
      const animate = instance?.$el.childNodes[1].animate;
      if (show) {
        instance?.show();
        if (animate) instance?.$el.childNodes[1].animate?.(...getAnimationProps());
      } else {
        if (animate) {
          const animation = instance?.$el.childNodes[1]?.animate(...getAnimationProps(true));
          animation?.finished.then(() => instance?.hide());
        } else {
          instance?.hide();
        }
      }
    }
  }, [show, instance, getAnimationProps]);

  const header = useMemo(() => {
    const header = React.Children.toArray(children).find(child => child.type === ModalHeader);
    if (header) {
      return cloneElement(header, { attr });
    }

    return (
      <ModalHeader
        title={title}
        description={description}
        attr={attr}
        hideCloseButton={hideCloseButton}
        closeButtonAriaLabel={closeButtonAriaLabel}
      />
    );
  }, [children, attr, title, description, hideCloseButton, closeButtonAriaLabel]);

  const content = useMemo(() => {
    return (
      React.Children.toArray(children).find(child => child.type === ModalContent) || (
        <ModalContent>
          {React.Children.toArray(children).filter(child => child.type !== ModalHeader && child.type !== ModalFooter)}
        </ModalContent>
      )
    );
  }, [children]);

  const footer = useMemo(() => {
    return React.Children.toArray(children).find(child => child.type === ModalFooter) || null;
  }, [children]);

  const dialog = ReactDOM.createPortal(
    <div
      {...attr.container}
      className={cx(styles.container, classNames.container)}
      data-testid="monday-dialog-container"
    >
      <div {...attr.overlay} className={cx(styles.overlay, classNames.overlay)} data-testid="monday-modal-overlay" />
      <div
        {...attr.dialog}
        className={cx(styles.dialog, classNames.modal, {
          [styles.default]: size === MODAL_SIZE.DEFAULT,
          [styles.full]: size === MODAL_SIZE.FULL_WIDTH
        })}
      >
        {header}
        {content}
        {footer}
      </div>
    </div>,
    document.body
  );

  return <>{dialog}</>;
};

Modal.propTypes = {
  /**
   * Id of the modal, used internaly and for accessibility
   */
  id: PropTypes.string.isRequired,
  /**
   * Show/hide the Dialog
   */
  show: PropTypes.bool.isRequired,
  /**
   * Title for the modal, required for accessibility
   */
  title: PropTypes.string.isRequired,
  /**
   * Description for the modal title
   */
  description: PropTypes.string,
  /**
   * Called when the modal is closed (by close button/click outside/esc key
   */
  onClose: PropTypes.func.isRequired,
  /**
   *  Makes the dialog behave like a modal (preventing closing on click outside of
   *  ESC key)..
   */
  isAlertDialog: PropTypes.bool,
  /**
   *  Used for the fromOrigin animation
   */
  triggerElement: PropTypes.instanceOf(Element),
  /**
   *  Define modal width
   */
  size: PropTypes.oneOf(Object.values(MODAL_SIZE)),
  /**
   *  Hide the modal close button
   */
  hideCloseButton: PropTypes.bool,
  /**
   *  Aria label for the close button
   */
  closeButtonAriaLabel: PropTypes.string,
  /**
   *  classNames for specific parts of the dialog
   */
  classNames: PropTypes.exact({
    container: PropTypes.string,
    overlay: PropTypes.string,
    modal: PropTypes.string
  }),
  /**
   *  Dialog content
   */
  children: PropTypes.node
};

Modal.Size = MODAL_SIZE;

Modal.defaultProps = {
  triggerElement: null,
  isAlertDialog: false,
  children: undefined,
  size: MODAL_SIZE.DEFAULT,
  classNames: {
    container: "",
    overlay: "",
    modal: ""
  },
  hideCloseButton: false,
  description: "",
  closeButtonAriaLabel: "close"
};

export default Modal;
