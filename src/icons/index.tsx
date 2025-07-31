import React from "react";
import PlusIcon from "./plus.svg";
import CloseIcon from "./close.svg";
import BoxIcon from "./box.svg";
import CheckCircleIcon from "./check-circle.svg";
import AlertIcon from "./alert.svg";
import InfoIcon from "./info.svg";
import ErrorIcon from "./info-hexa.svg";
import BoltIcon from "./bolt.svg";
import ArrowUpIcon from "./arrow-up.svg";
import ArrowDownIcon from "./arrow-down.svg";
import FolderIcon from "./folder.svg";
import VideoIcon from "./videos.svg";
import AudioIcon from "./audio.svg";
import GridIcon from "./grid.svg";
import FileIcon from "./file.svg";
import DownloadIcon from "./download.svg";
import ArrowRightIcon from "./arrow-right.svg";
import GroupIcon from "./group.svg";
import BoxIconLine from "./box-line.svg";
import ShootingStarIcon from "./shooting-star.svg";
import DollarLineIcon from "./dollar-line.svg";
import TrashBinIcon from "./trash.svg";
import AngleUpIcon from "./angle-up.svg";
import AngleDownIcon from "./angle-down.svg";
import PencilIcon from "./pencil.svg";
import CheckLineIcon from "./check-line.svg";
import CloseLineIcon from "./close-line.svg";
import ChevronDownIcon from "./chevron-down.svg";
import ChevronUpIcon from "./chevron-up.svg";
import PaperPlaneIcon from "./paper-plane.svg";
import LockIcon from "./lock.svg";
import EnvelopeIcon from "./envelope.svg";
import UserIcon from "./user-line.svg";
import CalenderIcon from "./calender-line.svg";
import TimeIcon from "./time.svg";
import CopyIcon from "./copy.svg";
import UserCircleIcon from "./user-circle.svg";
import TaskIcon from "./task-icon.svg";
import ListIcon from "./list.svg";
import TableIcon from "./table.svg";
import PageIcon from "./page.svg";
import PieChartIcon from "./pie-chart.svg";
import BoxCubeIcon from "./box-cube.svg";
import PlugInIcon from "./plug-in.svg";
import DocsIcon from "./docs.svg";
import MailIcon from "./mail-line.svg";
import HorizontaLDots from "./horizontal-dots.svg";
import ChatIcon from "./chat.svg";
import MoreDotIcon from "./more-dot.svg";
import BellIcon from "./bell.svg";

// Create React components for the icons that need them
const EyeIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M10 5.5C7.5 5.5 5.45 7.08 4.5 9.5C5.45 11.92 7.5 13.5 10 13.5C12.5 13.5 14.55 11.92 15.5 9.5C14.55 7.08 12.5 5.5 10 5.5ZM10 12C8.62 12 7.5 10.88 7.5 9.5S8.62 7 10 7S12.5 8.12 12.5 9.5S11.38 12 10 12ZM10 8C9.17 8 8.5 8.67 8.5 9.5S9.17 11 10 11S11.5 10.33 11.5 9.5S10.83 8 10 8Z"
    />
  </svg>
);

const EyeCloseIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M15.83 8.5L14.5 9.83L13.17 8.5L11.83 9.83L10.5 8.5L9.17 9.83L7.83 8.5L6.5 9.83L5.17 8.5L3.83 9.83L2.5 8.5L4.5 9.5C5.45 11.92 7.5 13.5 10 13.5C12.5 13.5 14.55 11.92 15.5 9.5L17.5 8.5L15.83 8.5ZM10 12C8.62 12 7.5 10.88 7.5 9.5C7.5 9.17 7.58 8.85 7.72 8.58L11.42 12.28C11.15 12.42 10.83 12.5 10.5 12.5C10.33 12.5 10.17 12.5 10 12Z"
    />
  </svg>
);

const ChevronLeftIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <path
      d="M12.604 15.208L7.396 10L12.604 4.792"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export {
  DownloadIcon,
  BellIcon,
  MoreDotIcon,
  FileIcon,
  GridIcon,
  AudioIcon,
  VideoIcon,
  BoltIcon,
  PlusIcon,
  BoxIcon,
  CloseIcon,
  CheckCircleIcon,
  AlertIcon,
  InfoIcon,
  ErrorIcon,
  ArrowUpIcon,
  FolderIcon,
  ArrowDownIcon,
  ArrowRightIcon,
  GroupIcon,
  BoxIconLine,
  ShootingStarIcon,
  DollarLineIcon,
  TrashBinIcon,
  AngleUpIcon,
  AngleDownIcon,
  PencilIcon,
  CheckLineIcon,
  CloseLineIcon,
  ChevronDownIcon,
  PaperPlaneIcon,
  EnvelopeIcon,
  LockIcon,
  UserIcon,
  CalenderIcon,
  EyeIcon,
  EyeCloseIcon,
  TimeIcon,
  CopyIcon,
  ChevronLeftIcon,
  UserCircleIcon,
  ListIcon,
  TableIcon,
  PageIcon,
  TaskIcon,
  PieChartIcon,
  BoxCubeIcon,
  PlugInIcon,
  DocsIcon,
  MailIcon,
  HorizontaLDots,
  ChevronUpIcon,
  ChatIcon,
};
