
import React, { useRef, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate hook
import { IoMdArrowBack } from "react-icons/io";
import { IoCopyOutline } from "react-icons/io5";
import useDrivePicker from 'react-google-drive-picker';
import { CLIENTID, DEVELOPERKEY, HOST } from '../utils/constants';
import axios from 'axios';
import Cookies from 'js-cookie';
import { UserContext } from "../context/UserContext";
import Loader from "./Loader";
const TitleBarPreview = ({appName, spreadSheetID, spreadSheetName}) => {
  const navigate = useNavigate(); // Initialize the navigate function
  const [openPicker, authResponse] = useDrivePicker();
  const clientId = CLIENTID
  const developerKey = DEVELOPERKEY
  const token = Cookies.get('token');
  const [loading, setLoading] = useState(false);
  const { token: userToken } = useContext(UserContext);

  const handleCopy = () => {
    // setLoading(true);
   console.log({appName, spreadSheetID, spreadSheetName});
    axios
      .post(
        `${HOST}/copySpreadsheet`,
        {
          spreadSheetID: spreadSheetID,
          spreadSheetName: spreadSheetName,
          appName: appName,
        },
        {
          headers: {
            authorization: "Bearer " + userToken,
          },
        }
      )
      .then(({ data: res, status }) => {
        if (status === 200 && !res.error) {
          console.log("res data: ", res);
          // Redirect to edit page with the new spreadsheet ID
          navigate(`/${res._id}/edit`);
        } else {
          alert(res.error);
        }
      })
      .catch((err) => {
        console.log(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleOpenPicker = () => {
    openPicker({
        clientId,
        developerKey,
        viewId: "DOCS",
        showUploadView: true,
        showUploadFolders: true,
        supportDrives: true,
        multiselect: true,
        callbackFunction: (data) => {
            if (data.action === 'cancel') {
                console.log('User clicked cancel/close button');
            }
            console.log(data);
            handleAddSheet(data);
        },
    });
};


const handleAddSheet = (data) => {
  if (data.action === "picked") {
      console.log("data", data);

      axios
          .post(
              `${HOST}/createNewSpreadsheet`,
              {
                  url: data?.docs?.[0]?.url,
                  spreadSheetID: data?.docs?.[0]?.id,
                  sheetName: data?.docs?.[0]?.name,
                  appName: appName
              },
              {
                  headers: {
                      authorization: "Bearer " + token
                  },
              }
          )
          .then(({ data: res, status }) => {
              if (status === 200 && !res.error) {
                  console.log("res data: ", res);
                  // Redirect to edit page with the new spreadsheet ID
                  navigate(`/${res._id}/edit`);
              } else {
                  alert(res.error);
              }
          })
          .catch((err) => {
              console.log(err.message);
          });
  }
};

  return (
    <div className="flex justify-between items-center bg-transparent box-border py-[10px] px-[20px]">
      {/* Title Section */}
      <div className="flex items-center justify-start w-full gap-[38px]">
        <IoMdArrowBack
          className="text-[37px] text-black cursor-pointer "
          onClick={() => navigate("/Dashboard")} // Navigate to the dashboard page
        />
        <h1 className="text-[30px] font-medium leading-normal text-[#2A3C54] font-poppins m-0">
          {/* People Directory Preview */}
          {appName + " Preview"}
        </h1>
      </div>

      {/* Buttons Section */}
      <div className="flex gap-[20px]">
        {/* <button className="flex justify-center items-center w-[41.163px] h-[41.163px] bg-[#598931] border-none rounded-[5.145px] cursor-pointer transition-colors duration-300 hover:bg-[#497626]">
          <IoSearch className="text-white w-[22.297px] h-[22.297px] " />
        </button> */}
        <button
          className="flex py-[5px] px-[10px] justify-center items-center gap-[5px] flex-shrink-0 bg-primary text-white rounded-md hover:bg-secondary"
          onClick={handleOpenPicker}
        >
          <span className="text-white font-poppins text-[14px] font-bold leading-normal">
            +
          </span>
          <span className="text-white font-poppins text-[14px] font-bold leading-normal">
            Create App from zero
          </span>
          {/* + Create app from zero */}
        </button>

        {loading && (
            <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
              <Loader textToDisplay="Creating a copy..." />
            </div>
          )}
        <button className="flex justify-center items-center w-[90px] h-[49px] bg-[#598931] border-none rounded-[5.145px] cursor-pointer transition-colors duration-300 hover:bg-secondary" onClick={handleCopy}
          title="Copy App"
        >
          <IoCopyOutline className="text-white w-[24px] h-[24px] " />{" "}
          {/* copy icon */}
        </button>
      </div>
    </div>
  );
};

export default TitleBarPreview;