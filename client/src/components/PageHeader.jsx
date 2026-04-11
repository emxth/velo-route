import { motion } from "framer-motion";
import { FaPlus } from "react-icons/fa";

const PageHeader = ({
  title,
  description,
  buttonText,
  onButtonClick,
  showButton = true,
  buttonIcon: ButtonIcon = FaPlus
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-between items-center flex-wrap gap-4"
    >
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">{title}</h1>
        {description && (
          <p className="text-neutral-600 mt-1">{description}</p>
        )}
      </div>
      {showButton && onButtonClick && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onButtonClick}
          className="btn-primary flex items-center gap-2 p-3 rounded-full"
        >
          <ButtonIcon /> {buttonText}
        </motion.button>
      )}
    </motion.div>
  );
};

export default PageHeader;