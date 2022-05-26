//
//  ViewController.swift
//  QVueInterfaceTester
//
//  Created by Brent Kaji on 4/28/22.
//

import UIKit

extension UIImage {
    /// Inverts the colors from the current image. Black turns white, white turns black etc.
    func invertedColors() -> UIImage? {
        guard let ciImage = CIImage(image: self) ?? ciImage, let filter = CIFilter(name: "CIColorInvert") else { return nil }
        filter.setValue(ciImage, forKey: kCIInputImageKey)

        guard let outputImage = filter.outputImage else { return nil }
        return UIImage(ciImage: outputImage)
    }
}

class ViewController: UIViewController {
    let apiBase = "https://quidel-staging.reliantid.com"

    @IBOutlet weak var integrationKey: UITextField!
    @IBOutlet weak var testReferenceID: UITextField!
    @IBOutlet weak var returnDeepLink: UITextField!

    @IBOutlet weak var testAccessKey: UITextField!
    @IBOutlet weak var integrationDeepLink: UITextField!
    
    @IBOutlet weak var requestAccessIndicator: UIActivityIndicatorView!
    @IBOutlet weak var queryResultIndicator: UIActivityIndicatorView!
    
    @IBOutlet weak var testResults: UITextView!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        let tap = UITapGestureRecognizer(target: self, action: #selector(dismissKeyboard))
        view.addGestureRecognizer(tap)
    }
    
    @objc func dismissKeyboard() {
        //Causes the view (or one of its embedded text fields) to resign the first responder status.
        view.endEditing(true)
    }

    @IBAction func requestAccess(_ sender: Any) {
        requestAccessIndicator.startAnimating()
        
        // reset the response text fields
        testAccessKey.text = ""
        integrationDeepLink.text = ""

        // format the request to get a Test Access Key (and App Deep Link)
        let url = URL(string: apiBase + "/integration/test/accessKey")
        var urlRequest = URLRequest(url: url!)
        urlRequest.httpMethod = "POST"
        urlRequest.setValue("Application/json", forHTTPHeaderField: "Content-Type")
        // Set a HTTP header property ("integration-key") containing the QVue Integration Key you received for your integration to the QVue app
        urlRequest.setValue(integrationKey.text ?? "", forHTTPHeaderField: "integration-key")
        
        // Set the parameters for the HTTP body
        var parameters: [String: Any] = [
            "externalRefId": testReferenceID.text ?? "",
            "externalReturnUrl": returnDeepLink.text?.trimmingCharacters(in: CharacterSet.whitespacesAndNewlines) ?? ""
        ]
        
        if (returnDeepLink.text ?? "").isEmpty {
            // The "externalReturnUrl" is optional, so remove it if it is not specified
            parameters.removeValue(forKey: "externalReturnUrl")
        }
        guard let httpBody = try? JSONSerialization.data(withJSONObject: parameters) else { return }
        urlRequest.httpBody = httpBody
        
        let task = URLSession.shared.dataTask(with: urlRequest) { data, urlResponse, error in
            // Parse the response data, and update the UI
            if let data = data {
                do {
                    let json = try JSONSerialization.jsonObject(with: data)
                    if let json = json as? [String: Any] {
                        DispatchQueue.main.async {
                            self.requestAccessIndicator.stopAnimating()
                            
                            if let key = json["key"] as? String {
                                self.testAccessKey.text = key
                            }
                            if let applink = json["applink"] as? String {
                                self.integrationDeepLink.text = applink
                            }
                        }
                    }
                } catch {
                    print(error)
                }
            }
        }
        
        task.resume()
    }
    
    
    @IBAction func performTest(_ sender: Any) {
        if let url = URL(string: integrationDeepLink?.text ?? "") {
            if UIApplication.shared.canOpenURL(url) {
                UIApplication.shared.open(url)
            }
        }
    }
    
    @IBAction func queryResult(_ sender: Any) {
        queryResultIndicator.startAnimating()
        
        // reset the test result field
        testResults.text = ""

        // format the request to get a Test Access Key (and App Deep Link)
        let url = URL(string: apiBase + "/integration/test/results/" + (testAccessKey.text ?? ""))
        var urlRequest = URLRequest(url: url!)
        urlRequest.httpMethod = "GET"
        
        let task = URLSession.shared.dataTask(with: urlRequest) { data, urlResponse, error in
            // Parse the response data, and update the UI
            if let data = data {
                if let text = String(data: data, encoding: String.Encoding.utf8) {
                    DispatchQueue.main.async {
                        self.queryResultIndicator.stopAnimating()
                        self.testResults.text = text
                    }
                }
            }
        }
        
        task.resume()

    }
}

