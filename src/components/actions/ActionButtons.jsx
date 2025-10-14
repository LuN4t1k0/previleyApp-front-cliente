
import { useRole } from "@/context/RoleContext";
import { Button } from "@tremor/react";
import * as Icons from "@remixicon/react";

const ActionButtons = ({ actionsConfig, actionHandlers }) => {
  const { role } = useRole();

  return (
    <>
      {actionsConfig.map((action) => {
        if (action.rolesAllowed.includes(role)) {
          const handleClick = () => {
            const handler = actionHandlers && actionHandlers[action.actionType];
            if (handler) {
              handler();
            } else {
              console.warn(
                `No handler defined for actionType: ${action.actionType}`
              );
            }
          };

          const IconComponent = Icons[action.icon];

          return (
            <Button
              key={action.id}
              onClick={handleClick}
              color={action.color}
              className="flex items-center gap-2" // Asegura que ícono y texto estén alineados
            >
              {IconComponent && (
                <IconComponent className="w-5 h-5 inline-block" />
              )}{" "}
              {/* Ajustar el tamaño del ícono */}
              {action.buttonText}
            </Button>
          );
        }
        return null;
      })}
    </>
  );
};

export default ActionButtons;
