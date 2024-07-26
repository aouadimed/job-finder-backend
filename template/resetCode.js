exports.resetCodeContent = (resetCode) => `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <title>Reset Code</title>
    <style type="text/css">
      /* CLIENT-SPECIFIC STYLES */
      #outlook a {
        padding: 0;
      }
      .ReadMsgBody {
        width: 100%;
      }
      .ExternalClass {
        width: 100%;
      }
      .ExternalClass * {
        line-height: 100%;
      }
      body {
        -webkit-text-size-adjust: none;
        -ms-text-size-adjust: none;
        margin: 0;
        padding: 0;
        font-family: Arial, sans-serif;
      }
      table td {
        border-collapse: collapse;
      }
      img {
        display: block;
        height: auto;
        border: 0;
      }
      @media only screen and (max-width: 600px) {
        body {
          width: 100% !important;
          min-width: 100% !important;
        }
        table[class="content-wrapper"] {
          width: 100% !important;
        }
        td[class="reset-code"] {
          padding: 10px !important;
          font-size: 20px !important;
          text-align: center !important;
        }
        td[class="button-cell"] {
          padding: 10px !important;
          text-align: center !important;
        }
        a[class="reset-button"] {
          display: inline-block !important;
          padding: 10px 20px !important;
          background-color: #0099cc !important;
          color: #fff !important;
          text-decoration: none !important;
          border-radius: 5px !important;
          font-size: 16px !important;
        }
      }
    </style>
  </head>
  <body
    style="
      margin: 0;
      padding: 0;
      font-family: Arial, sans-serif;
      background-color: #f2f2f2;
    "
  >
    <table
      border="0"
      cellpadding="0"
      cellspacing="0"
      width="100%"
      class="content-wrapper"
      style="border-collapse: collapse; margin: 0; padding: 0"
    >
      <tr>
        <td align="center" valign="top" style="padding: 20px">
          <table
            border="0"
            cellpadding="0"
            cellspacing="0"
            width="400"
            class="email-container"
            style="border-collapse: collapse"
          >
            <tr>
              <td bgcolor="#ffffff" style="padding: 40px; border-radius: 5px">
                <table
                  border="0"
                  cellpadding="0"
                  cellspacing="0"
                  width="100%"
                  style="border-collapse: collapse"
                >
                  <tr>
                    <td align="center" style="padding-bottom: 20px">
                      <h1 style="font-size: 32px; margin: 0">Reset Code</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom: 20px">
                      <p style="font-size: 16px; margin: 0">
                        Use the following code to reset your password:
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td
                      class="reset-code"
                      style="
                        font-size: 24px;
                        font-weight: bold;
                        color: #0099cc;
                        padding: 30px;
                        text-align: center;
                        border: 1px solid #ddd;
                        border-radius: 5px;
                        background-color: #fff;
                      "
                    >
                      ${resetCode}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-top: 20px">
                      <p style="font-size: 16px; margin: 0">
                        This code will expire in 15 min. If you did not
                        request a password reset, please ignore this message.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td
                      class="button-cell"
                      style="padding-top: 30px; text-align: center"
                    >
                      <a
                        href="#"
                        class="reset-button"
                        style="
                          display: block;
                          padding: 20px 30px;
                          background-color: #0099cc;
                          color: #fff;
                          text-decoration: none;
                          border-radius: 5px;
                          font-size: 18px;
                        "
                        >Reset Password</a
                      >
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td
                style="
                  padding-top: 20px;
                  text-align: center;
                  font-size: 14px;
                  color: #999;
                "
              >
              <p style="margin-top: 30px; font-size: 14px; color: #999;">Please do not reply to this email as it is an automated message. Replies to this email will not be read or responded to. If you have any questions or concerns, please contact our customer support team at [support@aouadi.com].</p>

                <p style="margin: 0">
                  This email was sent by [Job Finder Team].
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;