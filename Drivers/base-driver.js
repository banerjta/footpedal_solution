export class BaseDriver {
  productId;
  vendorId;
  hidDevice;
  deviceName;

  constructor(vid, pid) {
    this.vendorId = vid;
    this.productId = pid;
  }

  /**
   * Responsible for opening HID device if given permissions and if not already
   *     opened, then returns the HID device.
   *
   * @returns {HIDDevice | undefined} Returns undefined if the device is
   *     already opened
   */
  open = async () => {
    const devicesWithPermissions = await navigator.hid.getDevices();
    let device = devicesWithPermissions.filter((deviceElement) => {
      // return this.filter(deviceElement.productId, deviceElement.vendorId);
      return (
        this.productId == deviceElement.productId &&
        deviceElement.vendorId == this.vendorId
      );
    })[0];
    console.log(device);
    if (device) {
      this.hidDevice = device;
      this.deviceName = device.productName;
      if (device?.opened) {
        return;
      }
      await this.hidDevice.open();
    }
  };

  setEntryHandler = (callbackFunction) => {
    this.hidDevice.oninputreport = (event) => {
      const { data, device, reportId } = event;
      let uint8Array = new Uint8Array(data.buffer);
      const deviceInput = uint8Array[0];
      console.log(deviceInput);
      // The following strings within the condition represent neutral entries by the device
      if (deviceInput !== 0) {
        callbackFunction(
          this.deviceName,
          this.vendorId,
          this.productId,
          // this.deviceEntries[deviceInput]
          deviceInput
        );
      }
    };
  };
  /**
   * Closes the HID device.
   */
  close = async () => {
    console.log(`${this.hidDevice} has been closed`);
    await this.hidDevice.close();
  };
}
