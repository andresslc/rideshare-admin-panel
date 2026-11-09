import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import Card from "../ui/Card";

const COLOR_ORDER = [
  {
    name: "primary",
    text: "text-primary-600",
    bg: "bg-primary-100/50 dark:bg-primary-900/20",
  },
  {
    name: "secondary",
    text: "text-secondary-600",
    bg: "bg-secondary-100/50 dark:bg-secondary-900/20",
  },
  {
    name: "blue",
    text: "text-blue-600",
    bg: "bg-blue-100 dark:bg-blue-900/20",
  },
  {
    name: "green",
    text: "text-green-600",
    bg: "bg-green-100 dark:bg-green-900/20",
  },
  {
    name: "yellow",
    text: "text-yellow-600",
    bg: "bg-yellow-100 dark:bg-yellow-900/20",
  },
  {
    name: "purple",
    text: "text-purple-600",
    bg: "bg-purple-100 dark:bg-purple-900/20",
  },
];

const StatsCard = ({
  title,
  description,
  value,
  change,
  changeType = "positive",
  icon,
  colored = false,
  index = 0,
}) => {
  const colorObj = COLOR_ORDER[index % COLOR_ORDER.length];

  return (
    <Card className="flex justify-between items-center py-5">
      <div className="flex items-center w-full justify-between">
        <div className="flex-1 items-center">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p
            className={`text-2xl line-clamp-1 font-bold ${colored ? colorObj.text : "text-gray-900 dark:text-white"
              } mt-1`}
          >
            {value}
          </p>
          {description && (
            <p className="text-gray-400 text-xs mt-2">{description}</p>
          )}
          {change && (
            <div className="flex items-center mt-2">
              {changeType === "positive" ? (
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              ) : changeType === "negative" ? (
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              ) : (
                ""
              )}
              <span
                className={`text-sm font-medium ${changeType === "positive"
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                  }`}
              >
                {change}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                vs last period
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div className={`p-3 ml-4 rounded-lg ${colorObj.bg}`}>
            {React.cloneElement(icon, {
              className: `w-6 h-6 ${colorObj.text}`,
            })}
          </div>
        )}
      </div>
    </Card>
  );
};

export default StatsCard;
